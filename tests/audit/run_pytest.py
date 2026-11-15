"""Run the suite once with a diagnostic stack dump if a check stalls."""
import faulthandler
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
faulthandler.dump_traceback_later(30, repeat=False)
import pytest
try:
    result=pytest.main(['-q','--durations=5'])
finally:
    faulthandler.cancel_dump_traceback_later()
raise SystemExit(result)
