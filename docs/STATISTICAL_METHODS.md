# Statistical Trend Detection Methodology

Trend Compass implements a multi-method analytical suite designed to balance parametric precision with non-parametric robustness against outliers and serial autocorrelation.

---

## 1. Theil-Sen Robust Estimator (Sen's Slope)

The Theil-Sen estimator is a non-parametric method for robust linear regression. Rather than minimizing squared residuals (which is sensitive to extreme weather events and instrument spikes), it computes the median of all pairwise slopes:

$$\beta_{\text{Sen}} = \text{median}\left\{ \frac{y_j - y_i}{t_j - t_i} \;\middle|\; 1 \le i < j \le n \right\}$$

### Properties
- **Breakdown Point**: Approximately 29.3%, meaning up to nearly a third of the data can consist of extreme anomalies without distorting the estimated trajectory.
- **Confidence Intervals**: 95% non-parametric confidence limits are calculated using the rank order distribution of pairwise slopes corresponding to standard normal quantiles.

---

## 2. Ordinary Least Squares (OLS) Linear Regression

Standard parametric linear regression fits the model:

$$y_t = \alpha + \beta t + \varepsilon_t, \quad \varepsilon_t \sim \mathcal{N}(0, \sigma^2)$$

- **Slope**:
  $$\hat{\beta}_{\text{OLS}} = \frac{\sum_{t=1}^n (t - \bar{t})(y_t - \bar{y})}{\sum_{t=1}^n (t - \bar{t})^2}$$
- **Standard Error**:
  $$\text{SE}(\hat{\beta}) = \sqrt{\frac{\sum_{t=1}^n (y_t - \hat{y}_t)^2}{(n - 2) \sum_{t=1}^n (t - \bar{t})^2}}$$
- **Confidence Interval**:
  $$\hat{\beta}_{\text{OLS}} \pm t_{\alpha/2, n-2} \cdot \text{SE}(\hat{\beta})$$
- **Assumption Warning**: OLS assumes identically and independently distributed (i.i.d.) residuals. When environmental time series possess serial memory (autocorrelation), standard OLS underestimates $\text{SE}(\hat{\beta})$, resulting in artificially deflated $p$-values and false-positive trend declarations.

---

## 3. Original Mann-Kendall Test

The Mann-Kendall test evaluates the null hypothesis $H_0$ (no monotonic trend) against $H_1$ (monotonic increasing or decreasing trend):

$$S = \sum_{i=1}^{n-1} \sum_{j=i+1}^n \text{sgn}(y_j - y_i)$$

Where:
$$\text{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

Under $H_0$ and assuming independent observations, the variance of $S$ is:

$$\text{Var}(S) = \frac{n(n - 1)(2n + 5) - \sum_{k=1}^m t_k (t_k - 1)(2t_k + 5)}{18}$$

where $t_k$ is the number of ties in the $k$-th tied group.

The standardized test statistic $Z$ follows a standard normal distribution $\mathcal{N}(0, 1)$:

$$Z = \begin{cases} \frac{S - 1}{\sqrt{\text{Var}(S)}} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sqrt{\text{Var}(S)}} & \text{if } S < 0 \end{cases}$$

---

## 4. Hamed-Rao Modified Mann-Kendall Test (Autocorrelation Corrected)

Climate and geophysical observations routinely exhibit positive serial autocorrelation (e.g., warm months follow warm months). Positive autocorrelation inflates $\text{Var}(S)$, causing the original Mann-Kendall test to reject $H_0$ when no true trend exists.

The **Hamed & Rao (1998)** modified test computes an empirical variance correction factor based on the ranks of detrended observations:

$$\text{Var}^*(S) = \text{Var}(S) \cdot \frac{n}{n_s^*}$$

Where the correction factor is:

$$\frac{n}{n_s^*} = 1 + \frac{2}{n(n - 1)(n - 2)} \sum_{i=1}^{n-1} (n - i)(n - i - 1)(n - i - 2) \rho_s(i)$$

and $\rho_s(i)$ is the lag-$i$ rank autocorrelation of the detrended series.

Trend Compass adopts the **Hamed-Rao modified Mann-Kendall test as the primary arbiter of statistical significance** for all geophysical series.

---

## 5. Decision Logic & Method Disagreement Protocol

```
                                  Calculate Tests
                                (OLS & Hamed-Rao MK)
                                         |
                                         v
                     Is Hamed-Rao p-value < alpha (0.05)?
                                     /       \
                                   YES        NO
                                  /             \
                   Significant Trend          Not Statistically Significant
                          |                                 |
              Does OLS p-value agree?           Does OLS indicate p < 0.05?
                     /      \                               /       \
                   YES       NO                           YES        NO
                   /          \                           /           \
               Standard     Flag: OLS                Flag: OLS       Standard
               Agreement    Non-linear /             False Positive  Unanimous
                            Outlier Skew             due to Memory   Null
```

When OLS indicates significance ($p < 0.05$) but Hamed-Rao modified Mann-Kendall does not ($p \ge 0.05$), Trend Compass surfaces a prominent alert explaining that positive autocorrelation likely produced a spurious OLS finding.

