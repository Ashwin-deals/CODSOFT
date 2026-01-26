"""Data cleaning utilities for the Titanic dataset.

Provides a `clean_titanic_data` function which:
- loads the raw CSV
- imputes missing `Age` with median and `Embarked` with mode
- drops `Cabin`, `Name`, and `Ticket`
- encodes `Sex` and `Embarked` to numeric
- writes cleaned CSV to the processed folder
"""
import os
from pathlib import Path
from typing import Union, Optional

import pandas as pd


def clean_titanic_data(
    raw_path: Optional[Union[str, Path]] = None,
    out_path: Optional[Union[str, Path]] = None,
    inplace: bool = False,
) -> pd.DataFrame:
    """Load and clean the Titanic dataset.

    Args:
        raw_path: Path to the raw CSV file.
        out_path: Path where the cleaned CSV will be saved.
        inplace: If True, operate on the loaded dataframe in-place and still return it.

    Returns:
        The cleaned pandas DataFrame.
    """
    # If paths are not provided, build them relative to this script's directory
    if raw_path is None:
        raw_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data", "raw", "Titanic-Dataset.csv")
        )

    if out_path is None:
        out_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data", "processed", "cleaned_titanic.csv")
        )

    raw_path = Path(raw_path)
    out_path = Path(out_path)

    if not raw_path.exists():
        raise FileNotFoundError(f"Raw file not found: {raw_path}")

    df = pd.read_csv(raw_path)

    # Imputation
    if "Age" in df.columns:
        age_median = df["Age"].median()
        df["Age"] = df["Age"].fillna(age_median)

    if "Embarked" in df.columns:
        embarked_mode = df["Embarked"].mode(dropna=True)
        if not embarked_mode.empty:
            df["Embarked"] = df["Embarked"].fillna(embarked_mode.iloc[0])

    # Feature selection: drop specified columns if present
    for col in ("Cabin", "Name", "Ticket"):
        if col in df.columns:
            df = df.drop(columns=[col])

    # Encoding: Sex and Embarked -> numeric
    if "Sex" in df.columns:
        # map male->0, female->1 for readability
        df["Sex"] = df["Sex"].map({"male": 0, "female": 1}).astype(int)

    if "Embarked" in df.columns:
        # factorize ensures stable numeric codes for categories
        df["Embarked"], _ = pd.factorize(df["Embarked"])

    # Ensure output directory exists
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Save cleaned CSV
    df.to_csv(out_path, index=False)

    if inplace:
        # If caller passed an existing df, this would modify it; here we simply return the cleaned copy
        return df

    return df


if __name__ == "__main__":
    # When run as script, perform cleaning using default paths and print summary
    cleaned = clean_titanic_data()
    print("Cleaned data saved. Shape:", cleaned.shape)
