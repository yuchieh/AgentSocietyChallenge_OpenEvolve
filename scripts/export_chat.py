import os
import json
import sys

if len(sys.argv) < 2:
    print("Usage: python export_chat.py <conversation_id>")
    sys.exit(1)

cid = sys.argv[1]
brain_dir = "/Users/jack.ho/.gemini/antigravity-ide/brain"
overview_path = os.path.join(brain_dir, cid, ".system_generated", "logs", "overview.txt")

# Unified output destination
repo_docs_dir = "/Users/jack.ho/WorkSpace/LLM_APP_2026/AgentSocietyChallenge_OpenEvolve/docs/conversations"
os.makedirs(repo_docs_dir, exist_ok=True)
output_path = os.path.join(repo_docs_dir, f"chat_{cid}.md")

if not os.path.exists(overview_path):
    print(f"Error: Overview file not found at {overview_path}")
    sys.exit(1)

def clean_tags(text):
    text = text.replace("<USER_REQUEST>", "").replace("</USER_REQUEST>", "")
    # Remove metadata if present
    if "<ADDITIONAL_METADATA>" in text:
        text = text.split("<ADDITIONAL_METADATA>")[0]
    return text.strip()

chat_history = []

try:
    with open(overview_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                step = json.loads(line)
                step_type = step.get("type")
                source = step.get("source")
                content = step.get("content", "")
                created_at = step.get("created_at", "")
                
                if step_type == "USER_INPUT":
                    chat_history.append({
                        "role": "USER",
                        "time": created_at,
                        "text": clean_tags(content)
                    })
                elif source == "MODEL" and step_type == "PLANNER_RESPONSE" and content:
                    chat_history.append({
                        "role": "MODEL",
                        "time": created_at,
                        "text": content.strip()
                    })
            except Exception:
                pass
except Exception as e:
    print(f"Error reading logs: {e}")
    sys.exit(1)

if not chat_history:
    print("No conversation history found in overview.txt.")
    sys.exit(1)

markdown_lines = [
    f"# Chat Log: {cid}",
    f"\n*Exported from Antigravity logs.*\n",
    "---"
]

for idx, turn in enumerate(chat_history, 1):
    role_emoji = "👤 USER" if turn["role"] == "USER" else "🤖 ASSISTANT"
    markdown_lines.append(f"\n## {role_emoji} ({turn['time']})")
    markdown_lines.append(f"\n{turn['text']}\n")
    markdown_lines.append("---")

with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(markdown_lines))

print(f"Successfully exported chat log to:")
print(output_path)
