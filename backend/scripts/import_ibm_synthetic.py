"""Optional local importer for an externally licensed IBM synthetic fraud dataset.

Supply a local CSV path only after confirming its licence and governance terms. This module
does not download data, use credentials, or include any dataset in the repository.
"""
from pathlib import Path
import csv

REQUIRED = {"amount", "timestamp", "is_fraud"}

def validate_csv(path: str) -> int:
    """Validate a permitted local source and return row count without persisting PII."""
    source = Path(path)
    if not source.is_file(): raise FileNotFoundError(source)
    with source.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or not REQUIRED.issubset(reader.fieldnames):
            raise ValueError(f"Dataset must contain {sorted(REQUIRED)}")
        return sum(1 for _ in reader)

if __name__ == "__main__":
    import argparse
    parser=argparse.ArgumentParser(description="Validate a licensed local IBM synthetic dataset CSV")
    parser.add_argument("path"); args=parser.parse_args(); print({"rows": validate_csv(args.path)})
