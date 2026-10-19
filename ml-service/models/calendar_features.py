from typing import Set, Tuple

import holidays
import numpy as np
import pandas as pd

COUNTRY = "TN"
CLOSURE_MIN_RUN = 3
CLOSURE_MIN_YEARS = 2


def public_holidays(start: pd.Timestamp, end: pd.Timestamp) -> Set[pd.Timestamp]:
    cal = holidays.country_holidays(COUNTRY, years=range(start.year, end.year + 1))
    return {pd.Timestamp(d) for d in cal if start <= pd.Timestamp(d) <= end}


def learn_recurring_closures(series: pd.Series) -> Set[Tuple[int, int]]:
    zero = (series == 0).to_numpy()
    in_run = np.zeros(len(zero), dtype=bool)
    i = 0
    while i < len(zero):
        if zero[i]:
            j = i
            while j < len(zero) and zero[j]:
                j += 1
            if j - i >= CLOSURE_MIN_RUN:
                in_run[i:j] = True
            i = j
        else:
            i += 1
    years_by_day = {}
    for d in series.index[in_run]:
        years_by_day.setdefault((d.month, d.day), set()).add(d.year)
    return {md for md, years in years_by_day.items() if len(years) >= CLOSURE_MIN_YEARS}


class IndustrialCalendar:
    def __init__(self, train: pd.Series):
        self.closures = learn_recurring_closures(train)

    def flags(self, dates: pd.DatetimeIndex) -> pd.DataFrame:
        holi = public_holidays(dates.min(), dates.max())
        return pd.DataFrame(
            {
                "is_public_holiday": [1.0 if d in holi else 0.0 for d in dates],
                "is_closure": [1.0 if (d.month, d.day) in self.closures else 0.0 for d in dates],
            },
            index=dates,
        )

    def prophet_holidays(self, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
        dates = pd.date_range(start, end, freq="D")
        f = self.flags(dates)
        rows = [{"holiday": "jour_ferie_TN", "ds": d} for d in dates[f["is_public_holiday"].to_numpy() == 1]]
        rows += [{"holiday": "fermeture_usine", "ds": d} for d in dates[f["is_closure"].to_numpy() == 1]]
        return pd.DataFrame(rows, columns=["holiday", "ds"])
