import os
import json
import shutil

repo_docs_dir = "/Users/jack.ho/WorkSpace/LLM_APP_2026/AgentSocietyChallenge_OpenEvolve/docs/conversations"
os.makedirs(repo_docs_dir, exist_ok=True)

brain_dir = "/Users/jack.ho/.gemini/antigravity-ide/brain"

def clean_tags(text):
    text = text.replace("<USER_REQUEST>", "").replace("</USER_REQUEST>", "")
    # Remove metadata if present
    if "<ADDITIONAL_METADATA>" in text:
        text = text.split("<ADDITIONAL_METADATA>")[0]
    return text.strip()

def export_chat_to_repo(cid, filename):
    overview_path = os.path.join(brain_dir, cid, ".system_generated", "logs", "overview.txt")
    output_path = os.path.join(repo_docs_dir, filename)
    
    if not os.path.exists(overview_path):
        print(f"Skipping chat export for {cid}: Overview file not found.")
        return False
        
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
        print(f"Error reading logs for {cid}: {e}")
        return False
        
    if not chat_history:
        print(f"No history found in overview.txt for {cid}")
        return False
        
    markdown_lines = [
        f"# Chat Log: {cid}",
        f"\n*Exported history of the conversation from Antigravity logs.*\n",
        "---"
    ]
    for turn in chat_history:
        role_emoji = "👤 USER" if turn["role"] == "USER" else "🤖 ASSISTANT"
        markdown_lines.append(f"\n## {role_emoji} ({turn['time']})")
        markdown_lines.append(f"\n{turn['text']}\n")
        markdown_lines.append("---")
        
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(markdown_lines))
        
    print(f"Exported chat {cid} -> {filename}")
    return True

# 1. Export chats
export_chat_to_repo("f18a4ec5-0dd9-4dde-b738-4301cc780e1b", "chat_openevolve_discussion.md")
export_chat_to_repo("6b145954-f967-466a-85a0-edec225d960a", "chat_agent_troubleshooting.md")
export_chat_to_repo("0b2b8210-300b-47d3-abd0-3f3241f9142a", "chat_current_repo_summary.md")

# 2. Copy walkthroughs and plans
files_to_copy = [
    ("f18a4ec5-0dd9-4dde-b738-4301cc780e1b/openevolve_tutorial.md.resolved", "openevolve_tutorial.md"),
    ("38e8880d-bd07-456d-91a9-ab16d8ae0aab/walkthrough.md", "walkthrough_openevolve_integration.md"),
    ("38e8880d-bd07-456d-91a9-ab16d8ae0aab/implementation_plan.md", "implementation_plan_openevolve_integration.md"),
    ("1a25482f-3170-483a-b89b-44e88f9fb323/walkthrough.md", "walkthrough_baseline_system.md"),
    ("1a25482f-3170-483a-b89b-44e88f9fb323/implementation_plan.md", "implementation_plan_baseline_system.md")
]

for src_rel, dest_name in files_to_copy:
    src_path = os.path.join(brain_dir, src_rel)
    dest_path = os.path.join(repo_docs_dir, dest_name)
    if os.path.exists(src_path):
        try:
            shutil.copy(src_path, dest_path)
            print(f"Copied {src_rel} -> {dest_name}")
        except Exception as e:
            print(f"Error copying {src_rel}: {e}")
    else:
        print(f"File {src_path} does not exist, skipping.")

print(f"\nAll operations completed! Files are in: {repo_docs_dir}")
