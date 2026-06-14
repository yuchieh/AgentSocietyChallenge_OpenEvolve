# OpenEvolve 演化式編程執行指南：從設定到視覺化

這份指南將帶您一步步使用 `OpenEvolve` 框架，透過大型語言模型（LLM）來自主發現與演化出更優秀的演算法（以 `function_minimization` 尋找全局最佳解為例）。

## 1. 準備工作與環境隔離
本專案嚴格遵守使用 Astral `uv` 進行環境管理，避免污染全局環境。
如果您是首次執行，請先在專案根目錄下完成依賴同步：
```bash
uv sync
```
確保您的環境變數中已經準備好可用的 API Key（例如 NVIDIA NIM 端點的 Token）。

## 2. 修改 Config 檔案 (LLM 設定)
演化開始前，必須將任務資料夾內的 `config.yaml` 替換為我們實際要呼叫的模型。
以 `examples/function_minimization` 為例，將預設的 Gemini 模型修改為我們準備好的 `minimaxai` 模型：

```yaml
# examples/function_minimization/config.yaml
llm:
  # 替換為 NVIDIA NIM 上可用的模型
  primary_model: "minimaxai/minimax-m2.7"
  primary_model_weight: 0.8
  secondary_model: "minimaxai/minimax-m2.7"
  secondary_model_weight: 0.2
  
  # 將端點修改為 NVIDIA NIM Endpoint
  api_base: "https://integrate.api.nvidia.com/v1"
```

> [!TIP]
> OpenEvolve 支援任何相容 OpenAI 格式的端點。如果您日後想換回本地端的 Ollama 或其他伺服器，只要修改 `api_base` 即可。

## 3. 啟動演化進程
請確保在專案根目錄（`openevolve`）下已建立 `.env` 檔案，並填寫您的 API 資訊（`uv` 指令會自動載入 `.env` 內的環境變數）：
```env
# /Users/jack.ho/WorkSpace/openevolve/.env
OPENAI_API_KEY="您的_API_KEY"
OPENAI_API_BASE="您的_API_BASE"
```

接著，使用 `uv run` 執行演化啟動腳本 `openevolve-run.py`。
請記得傳入三樣東西：初始程式碼（種子）、評分器（Evaluator）以及設定檔。

```bash
cd examples/function_minimization
uv run --env-file ../../.env python ../../openevolve-run.py initial_program.py evaluator.py --config config.yaml
```

**背景運作原理：**
1. 系統會先透過 `evaluator.py` 對初始隨機搜尋演算法進行評分。
2. 啟動 **多島嶼模型 (Island-based evolution)**，讓多個平行的 LLM 程序各自嘗試修改程式碼。
3. 採用 **MAP-Elites (品質多樣性演算法)**，LLM 在過程中可能會寫出「複雜但精準」或「極簡但堪用」的不同分支，系統會依據多樣性保留不同特色的高分程式碼，而非單一最佳解。

## 4. 演化自動存檔 (Checkpoints)
演化過程中，系統會自動在 `openevolve_output/logs/` 紀錄每一次的錯誤回饋（Error Feedback）與除錯歷程。
當迭代次數達到設定的上限（或觸發存檔機制），就會把所有演化出的程式碼打包存在 `openevolve_output/checkpoints/checkpoint_{世代數}/` 中。

## 5. 啟動圖形化觀測儀 (Visualizer)
演化完成後，這是一個不可錯過的視覺化展示環節。您可以在瀏覽器上覆盤整個演化過程。

> [!WARNING]
> 在終端機輸入指令時，路徑的最後面 **絕對不能加上斜線 `/`**，這會導致 Python 的 `os.path.basename` 解析為空字串，進而發生 `No checkpoint folders found` 的錯誤。

建議直接將路徑指向 `openevolve_output` 讓系統自動抓取最新進度：
```bash
uv run python ../../scripts/visualizer.py --path openevolve_output
```

**觀看重點：**
開啟 `http://127.0.0.1:8080` 後，您可以觀看：
1. **🌳 演化樹狀圖 (Evolution Tree)**：清晰看出演算法是怎麼一步一步分支、變異的。
2. **🔍 程式碼差異 (Code Diff Viewer)**：LLM 究竟改了哪幾行程式碼才突破了局部最佳解的限制？
3. **📈 MAP-Elites 網格圖**：檢視火力分佈，了解不同複雜度與多樣性維度下生成的最佳解集合。
