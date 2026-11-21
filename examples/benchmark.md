# Six additional bilingual checks outside SMA

Keep the original SMA evaluation set. Run these additional cases separately on each surface. For discovery use the English keywords, inspect up to five candidates and record their rank. In a second run use the Vietnamese wording as written. An exact DOI check and a keyword search answer different questions.

| ID | Vietnamese question | English search or task | Accepted source or action |
|---|---|---|---|
| B1 | Thử nghiệm nào xét ảnh hưởng của tỷ số nhịp cắt và chiều cao hữu hiệu đến sức kháng cắt của dầm cao? | reinforced concrete deep beams shear behavior shear span depth effective beam depth 24 beams | [ACI study](https://doi.org/10.14359/51689151) |
| B2 | Nghiên cứu nào xét cốt thép bụng ngang và bản đệm gối trong dầm cao? | horizontal web reinforcement depth bearing plates serviceability reinforced concrete deep beams | [Structures study](https://doi.org/10.1016/j.istruc.2024.107106) |
| B3 | Có nghiên cứu nào mô hình hóa phân bố xác suất của hệ số khuếch tán clorua trong bê tông cốt liệu tái chế? | probability distribution chloride diffusion coefficient recycled aggregate concrete | [Ying, Xiao and Meng](https://doi.org/10.1007/s40069-015-0123-6) |
| B4 | Bài nào đề xuất hai bước tính hệ số khuếch tán clorua khi có cả cốt liệu tự nhiên và tái chế? | two-step approach calculating chloride diffusion coefficient natural recycled aggregates | [Yuan, Mao and Li](https://doi.org/10.1016/j.scitotenv.2022.159197) |
| B5 | DOI của bài về dầm cao có khớp tiêu đề của bài về clorua không? | Verify 10.14359/51689151 with the title “On Probability Distribution of Chloride Diffusion Coefficient for Recycled Aggregate Concrete” | DOI resolves; title differs. [DOI supplied](https://doi.org/10.14359/51689151) · [Title supplied](https://doi.org/10.1007/s40069-015-0123-6) |
| B6 | “Bài về độ bền bê tông” là bài nào? | Identify “the concrete durability paper”, with no other identifying information | Insufficient information. Ask for an author, title fragment, DOI or year. No single DOI is accepted. |

Record date, language, surface, case ID, rank or missing, and the returned DOI. Mark a timeout or rate limit as unavailable. For B5 and B6 record the decision separately. Only the first four rows enter the top-five discovery rate. For an AI answer, also note whether its cited primary source actually supports the stated result. A new relevant candidate may be recorded for review outside the predeclared score.

## Observations on 21 November 2026

All 16 live keyword requests succeeded. The accepted work appeared in the top five for 3/4 English queries on both REST and MCP. Ranks for B1–B4 were absent, 1, 1 and 2. None of the four full Vietnamese questions returned the predeclared DOI in the top five on either interface. The sample is too small to estimate overall recall. A generated AI answer or a human citation was outside this measurement.

For an English-language journal, search a distinctive English title fragment or combine the material, test and variable. For example, “hệ số khuếch tán clorua trong bê tông cốt liệu tái chế” can be searched as “chloride diffusion coefficient recycled aggregate concrete”. If you already have a DOI, use the exact checker.

[Full timestamped results with all returned DOIs](results-2026-11-21.json) · [Reproducible run](https://github.com/ho11-bit/donvi108-agent-skills/actions/runs/44862405684)
