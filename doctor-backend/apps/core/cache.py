```python
"""
Redis-backed query caching layer for frequently accessed data.

Provides:
- CacheManager: High-level cache operations with key builders
- @cached_query: Decorator for caching queryset results with TTL
- @invalidate_on_change: Decorator for automatic cache invalidation on model changes
- Signal handlers for model save/delete invalidation
- Cache warming utilities
- Hit/miss metrics for telemetry
"""

import hashlib
import json
import logging
import time
from contextlib import contextmanager
from functools import wraps
from typing import Any, Callable, Optional, TypeVar, Union

from django.conf import settings
from django.core.cache import cache
from django.db.models import Model, QuerySet
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils.encoding import force_str

logger = logging.getLogger(__name__)

# Type variables for decorators
F = TypeVar("F", bound=Callable[..., Any])
ModelType = TypeVar("ModelType", bound=Model)

# Default TTLs (in seconds) - can be overridden in settings.CACHE_TTL_CONFIG
DEFAULT_TTL_CONFIG = {
    "doctor:list": 300,          # 5 minutes
    "doctor:detail": 600,        # 10 minutes
    "appointment:list": 60,      # 1 minute
    "appointment:detail": 300,   # 5 minutes
    "patient:list": 300,         # 5 minutes
    "patient:detail": 600,       # 10 minutes
    "schedule:list": 120,        # 2 minutes
    "default": 300,              # 5 minutes
}

# Metrics storage (in production, use Prometheus/StatsD)
_cache_metrics = {
    "hits": 0,
    "misses": 0,
    "sets": 0,
    "deletes": 0,
    "errors": 0,
}


def get_cache_metrics() -> dict[str, int]:
    """Return current cache metrics."""
    return _cache_metrics.copy()


def reset_cache_metrics() -> None:
    """Reset cache metrics counters."""
    global _cache_metrics
    _cache_metrics = {k: 0 for k in _cache_metrics}


class CacheKeyBuilder:
    """Builds consistent, namespaced cache keys."""

    NAMESPACE = getattr(settings, "CACHE_NAMESPACE", "doctor_backend")
    VERSION = getattr(settings, "CACHE_VERSION", "v1")

    @classmethod
    def _base(cls, *parts: str) -> str:
        return ":".join([cls.NAMESPACE, cls.VERSION, *parts])

    @classmethod
    def doctor_list(cls, specialty_id: Optional[int] = None, **filters) -> str:
        parts = ["doctor", "list"]
        if specialty_id:
            parts.append(f"specialty:{specialty_id}")
        if filters:
            filter_str = hashlib.md5(
                json.dumps(filters, sort_keys=True).encode()
            ).hexdigest()[:8]
            parts.append(f"filters:{filter_str}")
        return cls._base(*parts)

    @classmethod
    def doctor_detail(cls, doctor_id: int) -> str:
        return cls._base("doctor", "detail", str(doctor_id))

    @classmethod
    def appointment_list(cls, doctor_id: Optional[int] = None, patient_id: Optional[int] = None, **filters) -> str:
        parts = ["appointment", "list"]
        if doctor_id:
            parts.append(f"doctor:{doctor_id}")
        if patient_id:
            parts.append(f"patient:{patient_id}")
        if filters:
            filter_str = hashlib.md5(
                json.dumps(filters, sort_keys=True).encode()
            ).hexdigest()[:8]
            parts.append(f"filters:{filter_str}")
        return cls._base(*parts)

    @classmethod
    def appointment_detail(cls, appointment_id: int) -> str:
        return cls._base("appointment", "detail", str(appointment_id))

    @classmethod
    def patient_list(cls, **filters) -> str:
        parts = ["patient", "list"]
        if filters:
            filter_str = hashlib.md5(
                json.dumps(filters, sort_keys=True).encode()
            ).hexdigest()[:8]
            parts.append(f"filters:{filter_str}")
        return cls._base(*parts)

    @classmethod
    def patient_detail(cls, patient_id: int) -> str:
        return cls._base("patient", "detail", str(patient_id))

    @classmethod
    def schedule_list(cls, doctor_id: int, date_from: str, date_to: str) -> str:
        return cls._base("schedule", "list", f"doctor:{doctor_id}", f"from:{date_from}", f"to:{date_to}")

    @classmethod
    def custom(cls, *parts: str) -> str:
        return cls._base(*parts)

    @classmethod
    def pattern(cls, *parts: str) -> str:
        """Generate a pattern for wildcard invalidation."""
        return cls._base(*parts) + ":*"


class CacheManager:
    """High-level cache operations with metrics and error handling."""

    def __init__(self, backend: Optional[Any] = None):
        self._backend = backend or cache
        self._ttl_config = getattr(settings, "CACHE_TTL_CONFIG", DEFAULT_TTL_CONFIG)

    def _get_ttl(self, key: str) -> int:
        """Determine TTL based on key prefix."""
        for prefix, ttl in self._ttl_config.items():
            if key.startswith(f"{CacheKeyBuilder.NAMESPACE}:{CacheKeyBuilder.VERSION}:{prefix}"):
                return ttl
        return self._ttl_config.get("default", 300)

    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache with metrics."""
        try:
            value = self._backend.get(key, default)
            if value is not default:
                _cache_metrics["hits"] += 1
                logger.debug("Cache HIT: %s", key)
            else:
                _cache_metrics["misses"] += 1
                logger.debug("Cache MISS: %s", key)
            return value
        except Exception as e