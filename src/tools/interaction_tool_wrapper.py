import threading

from crewai.tools import tool

# 單例全域變數：負責盛裝執行期 Simulator.py 動態配給的 interaction_tool
_GLOBAL_INTERACTION_TOOL = None

# 合法的查詢類型（凍結的協議；對應底層 InteractionTool 的能力邊界）
VALID_QUERY_TYPES = ("user", "item", "review_by_user", "review_by_item")

# ---------------------------------------------------------------------------
# L0 儀表化：thread-safe 工具呼叫日誌
# Simulator 以 max_workers=2 跑 task，wrapper 會被多執行緒並行呼叫，
# 因此用 Lock 保護。日誌是「整批 evaluate 的聚合」用途（不做 per-task 歸因），
# 由 evaluator 在每輪 simulation 前後 drain。
# ---------------------------------------------------------------------------
_TOOL_CALL_LOG: list[dict] = []
_LOG_LOCK = threading.Lock()


def _record(query_type: str, ok: bool) -> None:
    with _LOG_LOCK:
        _TOOL_CALL_LOG.append({"query_type": query_type, "ok": ok})


def drain_tool_log() -> list[dict]:
    """取走並清空目前的呼叫日誌。evaluator 在 simulation 前呼叫一次清殘留，
    simulation 後再呼叫一次取本輪結果。"""
    global _TOOL_CALL_LOG
    with _LOG_LOCK:
        log, _TOOL_CALL_LOG = _TOOL_CALL_LOG, []
    return log


def inject_simulator_tool(tool_instance):
    global _GLOBAL_INTERACTION_TOOL
    _GLOBAL_INTERACTION_TOOL = tool_instance


@tool("Interaction Tool Wrapper")
def interaction_tool_wrapper(query_type: str, target_id: str) -> str:
    """
    能調用 AgentSociety 提供的本地檢索工具查詢歷史數據。
    query_type 必須是下列之一："user", "item", "review_by_user", "review_by_item"。
    target_id 是對應的 user_id 或 item_id。
    """
    if _GLOBAL_INTERACTION_TOOL is None:
        _record(query_type, ok=False)
        return "Error: InteractionTool has not been injected by the Simulator."

    try:
        if query_type == "user":
            result = str(_GLOBAL_INTERACTION_TOOL.get_user(user_id=target_id))
        elif query_type == "item":
            result = str(_GLOBAL_INTERACTION_TOOL.get_item(item_id=target_id))
        elif query_type == "review_by_user":
            result = str(_GLOBAL_INTERACTION_TOOL.get_reviews(user_id=target_id))
        elif query_type == "review_by_item":
            result = str(_GLOBAL_INTERACTION_TOOL.get_reviews(item_id=target_id))
        else:
            _record(query_type, ok=False)
            return "Error: Unknown query_type. Use exactly 'user', 'item', 'review_by_user' or 'review_by_item'."
        _record(query_type, ok=True)
        return result
    except Exception as e:
        _record(query_type, ok=False)
        return f"Error occurred during interaction_tool query: {str(e)}"


def get_interaction_tool():
    """回傳工具實例供 Crew Agent 使用"""
    return interaction_tool_wrapper


def get_injected_tool():
    """回傳 workflow() 注入的官方 interaction_tool 實例。
    供 L1 retrieval executor 在 crew 啟動前做確定性檢索使用
    （executor 不走 CrewAI tool 介面，直接呼叫官方 method）。"""
    return _GLOBAL_INTERACTION_TOOL
