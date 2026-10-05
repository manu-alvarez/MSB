<?php
/**
 * MSBrossAI — MASTER NEURAL GATEWAY v3.1
 * Central orchestrator for the entire ecosystem.
 * Handles: IAProd OS status, Traductor proxy, Vault state, orchestration.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-api-key");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ──────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────
$VAULT_FILE = __DIR__ . '/msbross_vault.json';
// Obtenemos la clave de una variable de entorno para no dejarla expuesta en el código (GitHub detecta y revoca las hardcodeadas).
$GEMINI_API_KEY = getenv('GEMINI_API_KEY') ?: "REPLACE_ME_SECRETS";

function get_vault() {
    global $VAULT_FILE;
    if (!file_exists($VAULT_FILE)) {
        return [
            "system" => ["fusion_level" => 3, "last_boot" => date('Y-m-d H:i:s')],
            "apps" => [],
            "notifications" => []
        ];
    }
    return json_decode(file_get_contents($VAULT_FILE), true);
}

function save_vault($data) {
    global $VAULT_FILE;
    file_put_contents($VAULT_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

/**
 * Call Gemini 3.5 Flash API for LLM processing
 */
function call_gemini($system_prompt, $user_text, $base64_image = null) {
    global $GEMINI_API_KEY;
    
    $parts = [["text" => $user_text]];
    
    if ($base64_image) {
        // Strip data URI prefix if present
        $mime_type = "image/jpeg";
        $b64_data = $base64_image;
        if (preg_match('/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/', $base64_image, $matches)) {
            $mime_type = $matches[1];
            $b64_data = $matches[2];
        }
        $parts[] = [
            "inlineData" => [
                "mimeType" => $mime_type,
                "data" => $b64_data
            ]
        ];
    }
    
    $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" . $GEMINI_API_KEY);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode([
            "system_instruction" => ["parts" => [["text" => $system_prompt]]],
            "contents" => [["role" => "user", "parts" => $parts]],
            "generationConfig" => ["temperature" => 0.3, "maxOutputTokens" => 1024]
        ]),
        CURLOPT_TIMEOUT => 60
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    
    if ($httpCode !== 200) {
        return null;
    }
    
    $data = json_decode($response, true);
    return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
}

// ──────────────────────────────────────────────
// ROUTING
// ──────────────────────────────────────────────
$action = $_GET['action'] ?? 'status';

switch ($action) {
    // ── IAProd OS ──
    case 'status':
        echo json_encode([
            "status" => "online",
            "version" => "3.1.0",
            "neural_bus" => "connected",
            "timestamp" => time()
        ]);
        break;

    case 'text-command':
        $input = json_decode(file_get_contents('php://input'), true);
        $text = $input['text'] ?? '';
        
        $system = "Eres IAProd OS, un asistente IA de élite en español. Responde de forma concisa, útil y directa. No uses markdown pesado ni emojis excesivos. Habla con naturalidad.";
        $result = call_gemini($system, $text);
        
        if ($result) {
            echo json_encode(["response" => $result, "emotion" => "neutral"]);
        } else {
            echo json_encode(["response" => "Modo offline: Mi backend no está conectado ahora mismo. Escribe 'ayuda' para ver qué puedo hacer en modo local.", "emotion" => "thinking"]);
        }
        break;

    case 'vision-analyze':
        $input = json_decode(file_get_contents('php://input'), true);
        $image = $input['image'] ?? '';
        $prompt = $input['prompt'] ?? 'Describe detalladamente lo que ves en esta imagen.';
        
        $system = "Eres IAProd OS, un sistema operativo IA experto en análisis visual. Analiza la imagen de forma concisa y directa.";
        $result = call_gemini($system, $prompt, $image);
        
        if ($result) {
            echo json_encode(["response" => $result, "emotion" => "thinking"]);
        } else {
            echo json_encode(["error" => "No se pudo analizar la imagen. Intenta de nuevo.", "emotion" => "error"]);
        }
        break;

    // ── Arantxa Translate ──
    case 'process':
        $input = json_decode(file_get_contents('php://input'), true);
        $texto = $input['texto'] ?? '';
        $origen = $input['origen'] ?? 'en';
        $destino = $input['destino'] ?? 'es';
        $modo = $input['modo'] ?? 'traducir_estandar';
        
        $modoLabel = match($modo) {
            'traducir_profesional', 'profesional' => 'profesional y formal',
            'traducir_coloquial', 'coloquial' => 'coloquial e informal',
            'resumir' => 'resumido',
            'traducir_resumir' => 'traducido y resumido',
            default => 'estándar y natural'
        };
        
        $system = "Eres un traductor profesional. Traduce del idioma '$origen' al idioma '$destino' con estilo $modoLabel. Devuelve SOLO la traducción, sin explicaciones ni notas.";
        $result = call_gemini($system, $texto);
        
        if ($result) {
            $resumen = '';
            if (str_contains($modo, 'resumir')) {
                $resumen = call_gemini("Resume este texto en 2-3 oraciones concisas en $destino:", $result) ?? '';
            }
            echo json_encode(["traduccion" => $result, "resumen" => $resumen, "provider" => "gemini"]);
        } else {
            echo json_encode(["error" => "El servicio de traducción no está disponible. Verifica la conexión."]);
        }
        break;

    // ── Vault ──
    case 'vault-get':
        echo json_encode(get_vault());
        break;

    case 'vault-update':
        $input = json_decode(file_get_contents('php://input'), true);
        $vault = get_vault();
        if (isset($input['app'])) {
            $vault['apps'][$input['app']] = array_merge($vault['apps'][$input['app']] ?? [], $input['data'] ?? []);
        }
        if (isset($input['notification'])) {
            $vault['notifications'][] = array_merge($input['notification'], ["timestamp" => time(), "id" => uniqid()]);
            if (count($vault['notifications']) > 20) array_shift($vault['notifications']);
        }
        save_vault($vault);
        echo json_encode(["status" => "updated"]);
        break;

    // ── Orchestration ──
    case 'orchestrate':
        $input = json_decode(file_get_contents('php://input'), true);
        $intent = $input['intent'] ?? '';
        $vault = get_vault();
        $vault['notifications'][] = [
            "type" => "COMMAND", "source" => "IAProd OS",
            "content" => "Ejecutando: $intent", "timestamp" => time()
        ];
        save_vault($vault);
        echo json_encode(["status" => "dispatched", "intent" => $intent]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Acción desconocida: $action"]);
        break;
}
