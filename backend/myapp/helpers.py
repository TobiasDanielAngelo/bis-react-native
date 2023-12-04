from datetime import date, datetime, timedelta
from django.utils import timezone
import math


def get_dates_start(range):
    now = timezone.localtime(timezone.now())
    print(now)
    mytz = timezone.get_current_timezone()
    if range == "5Y":
        return datetime(now.year - 4, 1, 1, tzinfo=mytz)
    elif range == "2Y":
        return datetime(now.year - 1, 1, 1, tzinfo=mytz)
    elif range == "1Y":
        return datetime(now.year, 1, 1, tzinfo=mytz)
    elif range == "1Q":
        quarter = math.ceil(now.month / 4)
        if quarter == 1:
            return datetime(now.year, 1, 1, tzinfo=mytz)
        elif quarter == 2:
            return datetime(now.year, 4, 1, tzinfo=mytz)
        elif quarter == 3:
            return datetime(now.year, 7, 1, tzinfo=mytz)
        elif quarter == 4:
            return datetime(now.year, 10, 1, tzinfo=mytz)
    elif range == "1M":
        return datetime(now.year, now.month, 1, tzinfo=mytz)
    elif range == "1W":
        return datetime(now.year, now.month, now.day, tzinfo=mytz) - timedelta(
            now.isocalendar()[2]
        )
    elif range == "1D":
        return datetime(now.year, now.month, now.day, tzinfo=mytz)
