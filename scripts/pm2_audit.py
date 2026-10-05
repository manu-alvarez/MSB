import json, subprocess

output = subprocess.check_output(["pm2", "jlist"]).decode("utf-8")
procs = json.loads(output)
for p in procs:
    name = p.get("name")
    cwd = p.get("pm2_env", {}).get("pm_cwd")
    exec_path = p.get("pm2_env", {}).get("pm_exec_path", "")
    args = p.get("pm2_env", {}).get("args", [])
    if isinstance(args, list):
        args = " ".join(args)
    full_cmd = f"{exec_path} {args}"
    
    print(f"[{name}]")
    print(f"Dir: {cwd}")
    print(f"Cmd: {full_cmd}")
    if "http.server" in full_cmd or "serve" in full_cmd or "http-server" in full_cmd:
        print("=> WARNING: Looks like a static server (no real backend framework)!")
    print("-" * 40)
