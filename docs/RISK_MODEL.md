# Plan-B Quantitative Risk & Simulation Model

## 1. Mathematical Risk Scoring Formula

For any event item $i$ and scenario $s$:

$$\text{RiskScore}(i, s) = \text{exposure}(i) \times \text{scenarioSeverity}(i, s) \times (1 - \text{mitigation}(i)) \times 100$$

All scores are clamped strictly between $[0, 100]$.

### 1.1 Exposure Factor ($\text{exposure} \in [0.10, 1.00]$)
Measures the intrinsic vulnerability of an item:
- **Baseline:** $0.50$
- **Outdoor Sensitivity:** $+0.35$ for outdoor Venue, Decor, AV; $+0.15$ for hybrid.
- **Indoor Shield:** $-0.15$ for indoor events.
- **Budget Concentration:** $+0.15$ if category represents $>25\%$ of total budget; $-0.10$ if $<8\%$.
- **Lack of Pre-Arranged Backup:** $+0.10$.

### 1.2 Scenario Severity ($\text{scenarioSeverity} \in [0.05, 1.00]$)
Derived from typed constant rules tables multiplied by location modifiers:

| Category | Rain (Outdoor) | Vendor No-Show | +30% Guest Surge | 15% Budget Cut |
| :--- | :---: | :---: | :---: | :---: |
| **Venue** | 0.90 | 0.98 | 0.75 | 0.30 |
| **Catering & Bar** | 0.75 | 0.95 | 0.90 | 0.60 |
| **Decor & Rentals** | 0.85 | 0.45 | 0.70 | 0.85 |
| **Entertainment & AV** | 0.90 | 0.80 | 0.30 | 0.70 |
| **Photography & Media** | 0.70 | 0.75 | 0.25 | 0.50 |
| **Misc & Permits** | 0.60 | 0.40 | 0.65 | 0.65 |

### 1.3 Mitigation Factor ($\text{mitigation} \in [0.00, 0.85]$)
Reflects pre-existing redundancies in the event plan:
- **Confirmed Backup Option:** $+0.35$
- **Vendor Formally Booked:** $+0.15$
- **Dedicated Contingency Buffer:** $+0.15$
- **Base Resilience Floor:** $+0.10$

### 1.4 Categorical Risk Bands
- **Low Risk:** $0 - 33$
- **Medium Risk:** $34 - 66$
- **High Risk:** $67 - 100$

---

## 2. Monte Carlo Budget Simulation

### 2.1 Triangular Distribution Sampling
To model realistic vendor overrun distributions without false symmetry, each category draws from a triangular distribution defined by parameters:
- $a = 0.95$ (Minimum negotiated savings)
- $c = 1.00$ (Mode / contracted baseline)
- $b = 1.00 + \text{volatility}$ (Maximum possible overrun, e.g. Catering $b = 1.25$)

Using Inverse Transform Sampling:
$$\text{Let } F_c = \frac{c - a}{b - a}$$
$$X = \begin{cases} 
a + \sqrt{U(b - a)(c - a)} & \text{if } U < F_c \\
b - \sqrt{(1 - U)(b - a)(b - c)} & \text{if } U \ge F_c 
\end{cases}$$
where $U \sim \text{Uniform}[0, 1)$ generated via the seeded Mulberry32 pseudo-random generator.

### 2.2 Percentile Outputs
Across 1,000 independent trials:
- **P50 (Median):** Expected operational spend.
- **P90 (Stress Threshold):** 90% of simulations finish at or below this cost.
- **Recommended Buffer Amount:** $\max(0, \text{P90} - \text{BaselineCost})$
- **Buffer Adequacy:** Compares the plan's mandatory buffer against recommended P90 reserves.
