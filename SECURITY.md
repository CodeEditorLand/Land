# Security Policy for Land Ecosystem Elements

The Land development team and the community of contributors are deeply committed
to the security of all software components within the Land Code Editor
ecosystem. We value the community's efforts in identifying and responsibly
disclosing security vulnerabilities. This document outlines the unified security
policy and reporting process for **this specific Element**, which is an integral
part of the broader Land project.

Your vigilance and responsible reporting help us maintain a safe and trustworthy
environment for all users and developers. Please adhere to this policy to ensure
that your findings are addressed effectively and efficiently.

## Guiding Principles

- **Proactive Security:** We strive to build security into our software from the
  ground up.
- **Responsible Disclosure:** We encourage private reporting of vulnerabilities
  to prevent premature public exposure that could put users at risk.
- **Timely Response:** We are committed to acknowledging, investigating, and
  addressing reported vulnerabilities in a timely manner.
- **Transparency:** We aim to be transparent about vulnerabilities once they are
  resolved, often through security advisories and crediting reporters.
- **Collaboration:** We believe in working collaboratively with security
  researchers and the community.

## Scope of this Policy

This security policy applies to vulnerabilities discovered within:

1.  **The codebase of this specific Land Element repository.** This includes all
    source code, build scripts, and configuration files contained herein.
2.  **Direct dependencies explicitly managed and bundled by this Element.**
3.  **The interaction points and APIs this Element exposes to other Land
    Elements or to the end-user through the Land application.**

Vulnerabilities in third-party libraries that are general dependencies (e.g., a
widely used open-source library not uniquely modified or configured by this
Element) should ideally be reported to the maintainers of those libraries first.
However, if such a vulnerability directly and significantly impacts the security
of this Element or the Land ecosystem through its usage in this Element, please
report it to us as well. We will assess how to mitigate it within our project
(e.g., by updating the dependency, applying a workaround, or temporarily
disabling affected functionality).

**Examples of vulnerabilities relevant to Land Elements might include (but are
not limited to):**

- **Remote Code Execution (RCE):** If an Element allows untrusted input to
  execute arbitrary code.
- **Privilege Escalation:** If an Element allows an unprivileged component or
  extension to gain higher privileges within the Land application or on the
  user's system.
- **Information Disclosure:** If an Element improperly exposes sensitive user
  data, configuration details, or system information.
- **Cross-Site Scripting (XSS):** Particularly relevant for UI-focused Elements
  (like `Sky` or `Wind`'s preload environment if it renders HTML content) where
  untrusted data could be injected into web views.
- **Denial of Service (DoS):** If an Element can be made unresponsive or crash
  due to specially crafted input or excessive resource consumption.
- **Path Traversal/Arbitrary File Access:** For Elements interacting with the
  filesystem (like `Mountain`'s FS handlers), ensuring that
  path inputs are properly sanitized.
- **Insecure IPC/Communication:** For Elements involved in inter-process
  communication (`Vine`, `Track`, `Echo`, `Mist`), vulnerabilities in the
  protocol or handling of messages.
- **Sandbox Escapes:** For Elements designed to run untrusted code (like
  `Cocoon` or a future `Grove`), vulnerabilities that allow code to escape its
  intended sandbox.
- **Authentication/Authorization Flaws:** If any Element implements access
  control mechanisms, flaws in these systems.
- **Data Integrity Issues:** If an Element allows unauthorized modification of
  critical data or configuration.

## Supported Versions

We are committed to providing security updates for the following versions of
this Land Element:

| Version Category                 | Supported          | Notes                                                                                                                                                                                          |
| :------------------------------- | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Current` Branch / Latest Commit | :white_check_mark: | Actively developed version; security fixes are typically applied here first.                                                                                                                   |
| Latest Tagged Pre-release        | :white_check_mark: | If pre-releases are used, the latest one is generally supported.                                                                                                                               |
| Latest Stable Release            | :white_check_mark: | The most recent officially "released" version of this Element, if applicable (some Elements may only exist on `Current`).                                                                      |
| Previous Stable Releases         | :x:                | Generally, only the latest stable release is supported. Critical vulnerabilities in widely used older stable versions might be considered on a case-by-case basis, but this is not guaranteed. |
| End-of-Life (EOL) Versions       | :x:                | Versions explicitly marked as EOL are not supported.                                                                                                                                           |

Please ensure you are testing against and reporting vulnerabilities for a
supported version. Reports for unsupported versions might not be prioritized or
addressed. If unsure, please report against the `Current` branch.

## Reporting a Security Vulnerability

**IMPORTANT: DO NOT report security vulnerabilities through public GitHub
issues, pull requests, or discussion forums for this repository.**

Public disclosure of a vulnerability before a fix is available can put the Land
ecosystem and its users at risk.

**To report a security vulnerability, please send a detailed email to our
central security address:**

➡️ [Security@Editor.Land](mailto:Security@Editor.Land) ⬅️

Please make sure your email includes:

1.  **Subject Line:** Clearly indicate it's a security vulnerability report and,
    if known, the affected Element. Example:
    `Security Vulnerability Report: [Element Name] - [Brief Vulnerability Type]`
2.  **Element Name:** The specific Land Element repository this vulnerability
    pertains to (e.g., "Wind", "Mountain", "Cocoon").
3.  **Affected Version(s):** The specific version(s) or commit hash(es) of the
    Element where the vulnerability was identified.
4.  **Vulnerability Type:** A classification of the vulnerability (e.g., RCE,
    XSS, Path Traversal, Information Disclosure).
5.  **Detailed Description:** A clear, concise, and comprehensive explanation of
    the vulnerability. What is it? How does it work?
6.  **Steps to Reproduce (Proof of Concept):** This is crucial. Provide
    detailed, step-by-step instructions that allow us to reproduce the
    vulnerability reliably.
    - Include any necessary setup, configuration, specific inputs, or code
      snippets.
    - A minimal, self-contained Proof of Concept (PoC) is highly preferred.
7.  **Potential Impact:** Describe the potential consequences if this
    vulnerability is exploited (e.g., "An attacker could read arbitrary files,"
    "This could lead to application crash," "Sensitive user tokens could be
    stolen").
8.  **Environment Details (if relevant):** Operating System, browser version
    (for UI elements), specific configurations of Land or the Element.
9.  **Your Contact Information:** Your name/alias and an email address for
    follow-up communication. This is essential for us to ask clarifying
    questions.
10. **Disclosure Intentions:** Please state if you have any intentions or
    timelines for public disclosure. We strongly prefer to coordinate disclosure
    once a fix is available.
11. **Credit/Acknowledgement:** Let us know if and how you would like to be
    credited if the vulnerability is confirmed and fixed.

Providing as much detail as possible will help us investigate and respond more
quickly.

## Our Vulnerability Management Process

Upon receiving your private vulnerability report at
[Security@Editor.Land](mailto:Security@Editor.Land), we will follow this
process:

1.  **Acknowledgement (within 3 business days):** We will send an email
    acknowledging receipt of your report.
2.  **Initial Triage & Validation (within 7-10 business days of
    acknowledgement):**
    - Our security team and relevant Element maintainers will review your report
      to understand and attempt to reproduce the vulnerability.
    - We will make an initial assessment of the vulnerability's validity and
      potential severity.
    - We may contact you for additional information or clarification during this
      phase.
3.  **In-Depth Investigation & Remediation Planning:**
    - If the vulnerability is confirmed, we will conduct a more thorough
      investigation to understand its full scope and impact.
    - We will prioritize the vulnerability based on its severity and begin
      planning and developing a fix. The timeline for a fix can vary
      significantly based on complexity.
4.  **Communication & Updates:** We will strive to keep you informed of our
    progress, especially regarding significant milestones like confirmation, fix
    development, and planned release of the fix.
5.  **Fix Development & Testing:** A patch will be developed, reviewed, and
    tested.
6.  **Coordinated Disclosure:** Once a fix is ready and deployed (e.g., merged
    to `Current` or included in an upcoming release), we will coordinate with
    you on the public disclosure of the vulnerability.
    - This may involve a GitHub Security Advisory, release notes, and
      appropriate credit to you as the reporter (if desired).
    - We generally request a period of 90 days for remediation before public
      disclosure, but this can be negotiated based on the circumstances.

## Confidentiality

We will treat your report and all communications as confidential. We will not
share information about the vulnerability with third parties without your
permission, except as necessary to investigate and remediate the issue (e.g.,
with core maintainers of an affected upstream dependency).

## Scope Exclusions (What Not to Report Here)

- **Denial of Service (DoS) on Public Infrastructure:** Please do not perform
  DoS testing against any public Land project infrastructure (e.g., websites,
  build servers).
- **Social Engineering:** Reports of successful social engineering (e.g.,
  phishing of project members) are out of scope for this code vulnerability
  policy.
- **Missing Security Best Practices (without exploitable impact):** For example,
  missing HTTP security headers on a non-sensitive static documentation site,
  unless you can demonstrate a direct exploitable vulnerability. Such issues are
  better raised as regular GitHub issues for improvement.
- **Reports from Automated Scanners:** While scanner results can be helpful
  starting points, please manually validate findings and provide a proof of
  concept demonstrating actual exploitability. Generic scanner output without
  context is unlikely to be acted upon as a priority security issue.
- **Self-XSS:** Cross-Site Scripting vulnerabilities that require the victim to
  paste code into their own browser console or modify their own client-side
  environment are generally not considered high-impact unless a plausible attack
  vector is demonstrated.
- **Issues requiring physical access to an unlocked device.**

When in doubt, please err on the side of reporting to
[Security@Editor.Land](mailto:Security@Editor.Land).

## Questions & Contact

For any questions regarding this security policy or the vulnerability reporting
process for any Land Ecosystem Element, please contact us at
[Security@Editor.Land](mailto:Security@Editor.Land).

Thank you for your commitment to helping us make the Land Code Editor ecosystem
more secure for everyone.
