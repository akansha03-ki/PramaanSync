# PramaanSync Project Governance & Contribution Model

## 1. Core Team Roles & Responsibilities

- **Lead Developer**: Responsible for core platform architecture, Express API design, React state management, and release engineering.
- **Forensic Domain Advisor**: Law enforcement domain consultant defining chain-of-custody protocols, evidence integrity standards, and court-admissible audit reports.
- **Security & Crypto Owner**: Responsible for SHA-256 root hashing algorithms, linked hash-chain verification, KMS key lifecycle management, and secondary passphrase gates.
- **OEM Adapter Maintainers**: Dedicated maintainers for vendor-specific parser contracts (Hikvision, Dahua, CP Plus, and community submissions).

---

## 2. Licensing & Commercial Model

PramaanSync operates on an **Open-Core** licensing framework:

- **Core Platform (Open Source)**: Core evidence vault, role-based access control, SHA-256 hashing, chain-of-custody timeline logging, basic OEM adapter layer, multi-camera sync view, and geospatial camera mapping are released under an open-source license.
- **Enterprise Extensions (Commercial License)**: Hardware-backed HSM integration, multi-agency cross-jurisdiction federation, automated video redaction, and enterprise SIEM audit integrations are licensed under enterprise commercial agreements.

---

## 3. Third-Party OEM Adapter Contribution Guidelines

We welcome community submissions for new vendor adapters (e.g. Honeywell, Uniview, TP-Link, Godrej, Matrix).

### Submission Requirements:
1. **Inheritance & Contract Compliance**: All custom adapters must extend the `OEMAdapter` base class and implement `detectVendor()`, `parseMetadata()`, `extractVideo()`, and `normalizeOutput()`.
2. **Mandatory Header Caveat**: Every custom adapter file must include the standard header comment:
   ```javascript
   // Detection is magic-byte/header based for prototype purposes; full proprietary codec decoding is out of scope for this build.
   ```
3. **CI Parser Test Suite Passing**: Submissions must include synthetic test fixtures added to `ParserTestSuite.js` and achieve 100% pass rate when running `npm run test:adapters`.
4. **Versioning Policy**: OEM adapters are versioned independently (`v1.x.x`) to allow rapid updates when vendors release new firmware signatures.
