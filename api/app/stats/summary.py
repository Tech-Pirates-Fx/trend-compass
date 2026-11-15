from api.app.schemas import SummaryVerdict, TrendMethodResult

def generate_summary(variable_name: str, units: str, start_year: str, end_year: str,
                     methods: dict[str, TrendMethodResult], alpha: float = .05,
                     inconclusive_reason: str | None = None) -> SummaryVerdict:
    """Separate the slope interval from the autocorrelation-aware rank-test verdict."""
    slope = methods.get('theil_sen') or methods.get('ols')
    if slope is None:
        raise ValueError('No valid slope estimate is available')
    rate = slope.slope_per_decade
    low, high = slope.ci_lower_decade, slope.ci_upper_decade
    if low is None or high is None:
        raise ValueError('No valid slope interval is available')
    primary = methods.get('mann_kendall_hamed_rao')
    reason = inconclusive_reason
    if primary is None or primary.p_value is None:
        reason = reason or 'The primary significance test could not be calculated.'
    verdict = 'inconclusive' if reason else ('significant' if primary.is_significant else 'not_significant')
    p = primary.p_value if primary else None
    primary_key = primary.method_key if primary else 'unavailable'
    primary_name = primary.display_name if primary else 'Unavailable'
    level = 1-alpha
    interval_label = f'{level:.1%} Theil–Sen interval (serial dependence not corrected)'
    finding = (f'Between {start_year} and {end_year}, {variable_name} in this region had an estimated rate of '
               f'{rate:+.3f} {units} per decade; {interval_label}: [{low:+.3f}, {high:+.3f}] {units}/decade. ')
    if reason:
        finding += f'Statistical significance is inconclusive. {reason}'
    elif primary.is_significant:
        finding += f'This trend is statistically significant under {primary_name} (p = {p:.4g}, alpha = {alpha:g}).'
    else:
        finding += f'This trend is NOT statistically significant under {primary_name} (p = {p:.4g}, alpha = {alpha:g}). This does not establish that the region is unchanging.'
    ols = methods.get('ols')
    agreement = None
    if ols and primary and ols.is_significant != primary.is_significant:
        agreement = 'OLS and Hamed–Rao return different significance decisions. The stated primary test determines the verdict; this alone does not identify a cause for their disagreement.'
    return SummaryVerdict(verdict=verdict, rate_per_decade=rate, units=units, ci_lower_decade=low,
        ci_upper_decade=high, p_value=p, primary_method=primary_key, plain_language=finding,
        agreement_notes=agreement, confidence_level=level, confidence_method=interval_label)
