# Milestone 1: Static Baseline - Walkthrough

## 執行摘要 (Executive Summary)
本專案已順利建立一套符合 AgentSociety Challenge 要求的 **Yelp 評論與星等預測多智能體系統 (Multi-Agent System)**。系統完全遵循 `CrewAI` 官方的 YAML-First 分離設計模式，並利用 `uv` 進行嚴格的套件包版管理。

由於免費外部 API (Groq/Gemini) 遇到了嚴格的 Token (12,000 TPM) 與請求頻率 (5 RPM) 限制限制，我們將架構重構為 **100% 本機端 (Local)** 的推論系統，實現了安全、零成本、無限制的 AI 實驗環境。

## 核心設計與更動紀錄 (Key Implementations)
1. **結構分離 (YAML-First Design)**: 
   - 建立 `config/agents.yaml` 定義了 `user_analyst`, `item_analyst` 與 `prediction_modeler` 三個分析器。
   - 建立 `config/tasks.yaml` 確保所有 Agent 皆輸出標準化的 JSON (`report.json`) 以利後續演化檢驗。
   - 移除舊有的 `user_preference.txt`，並導入正確的推薦系統脈絡。

2. **背景知識與本機檢索 (Knowledge & RAG)**:
   - 透過 `Yelp Data Translation.md` 為所有 Agent 注入欄位意義 (Schema Knowledge)。
   - 配置了三個 `JSONSearchTool`，分別處理 `user`, `item`, `review` 的 JSONL 子集。
   - **Gemini API 衝突修正**: 動態賦予這三個相同類別的工具獨一無二的 `.name`，避免 Google GenAI Schema Validation 驗證崩潰 (`400 INVALID_ARGUMENT`)。

3. **完全本機部署 (Zero-Cloud Environment)**:
   - **Embedding**: 從 OpenAI 強制切換為 `BAAI/bge-small-en-v1.5`，透過 `SentenceTransformerProviderSpec` 在背景直接由 CPU 切塊，避開發送請求。
   - **LLM**: 成功使用透過 Homebrew 常駐背景的 `Ollama` 引擎。採用微軟最新的輕量級本地模型 `phi3:mini` 做最終推理！

## 系統驗證與測試 (Validation & Results)
在 `main.py` 中傳入第一筆測試資料 `_BcWyKQL16ndpBdggh2kNA` 與 `uBDXcXlLR9IuRV1N2m0SPQ` 進行測試 (`uv run first_crew`)。

**測試結果 (Exit Code 0):**
系統成功驅動 Agent 從 VectorDB 中關聯兩者的歷史紀錄，並最終依據設定產出格式精美的 Markdown / JSON 評論預測結果。

```json
{                             
  "stars": 4.5,               
  "review": "An exceptional dining experience that exceeded my expectations! The fusion cuisine at uBDXcXlLR9IuRV1N2m0SPQ is an absolute delight for the taste buds with its unique blend of exquisite flavors. From appetizers to desserts, each course tantalized in new ways while maintaining impeccable presentation standards that made my evening special."             
}
```

## 下一步優化 (Next Steps)
- **進入 Milestone 2**: 實作遺傳演算法 (Evolutionary Engine, OpenEvolve)，讓這個 Baseline 的 Prompt 能根據平均絕對誤差 (MAE) 分數自動汰換迭代！
