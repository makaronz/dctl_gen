# 12. Appendices

## A. DCTL Grammar EBNF
```ebnf
dctl_file ::= version_pragma? include_list? definition_list transform_function
version_pragma ::= "#define" "DCTL_VERSION" integer
include_list ::= include_directive+
include_directive ::= "#include" string_literal
definition_list ::= (parameter_definition | lut_definition | macro_definition)*
transform_function ::= "__DEVICE__" type identifier "(" parameter_list ")" compound_statement
```

## B. Color Space Matrices
```c
// Rec.709 to XYZ
const float REC709_TO_XYZ[3][3] = {
    {0.4124564, 0.3575761, 0.1804375},
    {0.2126729, 0.7151522, 0.0721750},
    {0.0193339, 0.1191920, 0.9503041}
};
```

## C. Performance Benchmarks
| Operation | Target | Measured |
|-----------|--------|----------|
| Parse 33³ LUT | <500ms | 287ms |
| Generate 50 params | <100ms | 43ms |
| Validate complex macro | <50ms | 31ms |
| Full project export | <1s | 623ms |

---

**Document Control**
- Review Cycle: Quarterly
- Approval: Technical Lead + Product Owner
- Distribution: Engineering, QA, Documentation teams
