from abc import ABC, abstractmethod
from api.app.schemas import BoundingBox, TimeSeries, VariableMeta


class DataAdapter(ABC):
    """Abstract base class for all data adapters.

    Phase 1 implements MockAdapter.
    Phase 2 will implement RealNASADataAdapter (e.g., NASA Earthdata / CMR / Harmony).
    Swapping adapters requires only setting DATA_ADAPTER environment variable.
    """

    is_mock: bool = False

    @abstractmethod
    def list_variables(self) -> list[VariableMeta]:
        """List all variables available through this adapter."""
        pass

    @abstractmethod
    def get_timeseries(
        self,
        variable_id: str,
        bbox: BoundingBox,
        start: str = "2000-01",
        end: str = "2025-12",
        resolution: str = "monthly",
    ) -> TimeSeries:
        """Fetch time series data for a specific variable, bounding box, and temporal range."""
        pass
