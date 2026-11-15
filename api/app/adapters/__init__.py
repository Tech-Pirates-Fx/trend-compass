import os
from typing import Type
from api.app.adapters.base import DataAdapter
from api.app.adapters.mock import MockAdapter
from api.app.adapters.gistemp import GistempAdapter

# Adapter registry
_ADAPTER_REGISTRY: dict[str, Type[DataAdapter]] = {
    "mock": MockAdapter,
    "gistemp": GistempAdapter,
    # TODO (Phase 2): Register real NASA Earthdata adapter here once data sources are released
    # "nasa": RealNASADataAdapter,
}

_ACTIVE_ADAPTER_INSTANCE: DataAdapter | None = None


def get_adapter() -> DataAdapter:
    """Retrieve the singleton data adapter configured by DATA_ADAPTER env var."""
    global _ACTIVE_ADAPTER_INSTANCE
    if _ACTIVE_ADAPTER_INSTANCE is None:
        adapter_name = os.environ.get("DATA_ADAPTER", "gistemp").strip().lower()
        adapter_cls = _ADAPTER_REGISTRY.get(adapter_name)
        if adapter_cls is None:
            available = list(_ADAPTER_REGISTRY.keys())
            raise ValueError(f"Unknown DATA_ADAPTER '{adapter_name}'. Available: {available}")
        _ACTIVE_ADAPTER_INSTANCE = adapter_cls()
    return _ACTIVE_ADAPTER_INSTANCE


def reset_adapter() -> None:
    """Reset adapter instance (useful for unit testing with different environments)."""
    global _ACTIVE_ADAPTER_INSTANCE
    _ACTIVE_ADAPTER_INSTANCE = None

