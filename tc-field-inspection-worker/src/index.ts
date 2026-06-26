interface Env {
	ANTHROPIC_API_KEY: string
}

const ALLOWED_ORIGIN = 'https://peachtreeroofing.github.io'

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

function cors(body: string, status = 200) {
	return new Response(body, {
		status,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
	})
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS })
		}

		if (request.method !== 'POST') {
			return cors(JSON.stringify({ error: 'Method not allowed' }), 405)
		}

		let transcript: string
		try {
			const body = await request.json() as { transcript?: string }
			transcript = (body.transcript || '').trim()
		} catch {
			return cors(JSON.stringify({ error: 'Invalid JSON body' }), 400)
		}

		if (!transcript) {
			return cors(JSON.stringify({ error: 'transcript is required' }), 400)
		}

		const systemPrompt = `You are a roofing inspection data extractor for TC Roofing and Restorations LLC.
Extract structured data from the field inspection transcript and return ONLY valid JSON.
No preamble, no markdown fences, no explanation. Just the JSON object.

CRITICAL NORMALIZATION RULES - follow these exactly:
- Yes/No fields: return exactly "Yes" or "No"
- Shingle style: return exact values only: 3-Tab, Architectural, Designer, Disco, Impact Resistant
- Valley style: return exactly "Ice & Water" or "W-Valley" or "Valley Metal"
- Ridge vent type: return exactly "Metal" or "Shingle Over"
- Underlayment grade: return exactly "Synthetic" or "Felt" or "Unknown"
- Ridge cap grade: return exactly "3-Tab" or "H&R" or "Hi Profile"
- Starter style: return exactly "Starter Strip" or "3-Tab"
- Pipe jack type: return exactly "3-in-1/Neoprene" or "Lead" or "Lifetime/Silicone"
- Counter flashing action: return exactly "Replace" or "Reuse"
- Chimney size: return exactly "Small" (width < 24in), "Medium" (24-36in), or "Large" (> 36in)
- Residence type: return exactly "Primary" or "Rental"
- Gutter style: return exactly "Half Round" or "K-Style"
- Downspout width: return exactly "3\\" Std" or "4\\" Oversized"
- Preferred contact: comma-separated from: Phone, Email, Text

Return this exact structure (use null for any field not mentioned):
{
  "jobInfo": {
    "cust": null, "phone": null, "email": null, "addr": null,
    "pm": null, "insp": null, "ins": null, "claim": null,
    "date": null, "preferredContact": null, "residenceType": null,
    "tenantname": null, "tenantphone": null
  },
  "roof": {
    "shingleStyle": null, "stories": null, "layers": null, "pitch": null,
    "edgeFlashingType": null, "edgeMaterial": null, "edgePainted": null,
    "underlaymentPresent": null, "underlaymentGrade": null, "underlaymentLayers": null,
    "ridgeCapGrade": null, "ridgeCapExposure": null,
    "starterPresent": null, "starterStyle": null,
    "valleyPresent": null, "valleyStyle": null,
    "ridgeVentLF": null, "ridgeVentType": null, "ridgeVentPainted": null,
    "boxVentQty": null, "boxVentMaterial": null, "boxVentPainted": null,
    "turbineQty": null, "powerVentQty": null, "solarVentQty": null,
    "pipeJackType": null, "pipeJack15qty": null, "pipeJack2qty": null,
    "pipeJack3qty": null, "pipeJack4qty": null, "pipeJackPainted": null,
    "exhaustStackQty": null, "exhaustStackWidth": null,
    "exhaustStackDamageTo": null, "exhaustStackPainted": null,
    "kickoutsPresent": null, "kickoutsNeeded": null, "kickoutsPainted": null,
    "rainDiverterQty": null, "rainDiverterLF": null, "rainDiverterPainted": null,
    "powerMeterMastQty": null,
    "chimneySize": null, "chimneyQty": null, "cricketPresent": null,
    "chimneyPainted": null, "counterFlashingCondition": null, "chimneyConditionNotes": null,
    "stepFlashingPresent": null, "stepFlashingPainted": null,
    "counterFlashingPresent": null, "counterFlashingPainted": null,
    "lFlashingPresent": null, "lFlashingPainted": null,
    "lowSlopeLocation": null, "lowSlopeGrade": null, "lowSlopePitch": null,
    "lowSlopeDamaged": null, "exposedRafters": null
  },
  "elevations": {
    "Front": {
      "gutterSize": null, "gutterStyle": null, "gutterMaterial": null,
      "gutterLF": null, "gutterPainted": null, "gutterDamage": null,
      "gutterGuardsPresent": null, "downspoutQty": null, "downspoutLF": null,
      "downspoutWidth": null, "downspoutMaterial": null, "downspoutPainted": null,
      "downspoutDamage": null, "fasciaDamage": null, "sidingDamage": null,
      "gableVentDamage": null, "windowDamage": null, "screenQty": null,
      "screenSize": null, "screenDamage": null, "shutterDamage": null,
      "doorDamage": null, "garageDoorDamage": null
    },
    "Right": { "gutterLF": null, "downspoutQty": null, "fasciaDamage": null, "sidingDamage": null, "notes": null },
    "Rear":  { "gutterLF": null, "downspoutQty": null, "fasciaDamage": null, "sidingDamage": null, "notes": null },
    "Left":  { "gutterLF": null, "downspoutQty": null, "fasciaDamage": null, "sidingDamage": null, "notes": null }
  },
  "exterior": {
    "fenceMaterial": null, "fenceStyle": null, "fencePosts": null,
    "fencePostSpacing": null, "fenceHeight": null, "fenceStained": null,
    "fenceDamage": null, "gatesQty": null, "gatesMaterial": null, "gatesDamage": null,
    "poolCoverDamaged": null, "poolEquipmentDamaged": null, "poolDamageNotes": null,
    "outdoorDamagedItems": null, "outdoorNotes": null,
    "deliveryPlacement": null, "landscapingProtect": null,
    "okSaturdayBuild": null, "pestControlFlashing": null,
    "gateCode": null, "overheadClearanceIssue": null
  },
  "notes": {
    "summary": null, "concerns": null, "homeage": null, "crosssell": null,
    "roof": null, "roofage": null, "defects": null, "homeowner": null, "misc": null
  },
  "flags": []
}`

		const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': env.ANTHROPIC_API_KEY,
				'anthropic-version': '2023-06-01',
			},
			body: JSON.stringify({
				model: 'claude-sonnet-4-6',
				max_tokens: 4096,
				system: systemPrompt,
				messages: [{ role: 'user', content: `TRANSCRIPT:\n\n${transcript}` }],
			}),
		})

		if (!anthropicResp.ok) {
			const err = await anthropicResp.text()
			return cors(JSON.stringify({ error: `Anthropic error: ${anthropicResp.status}`, detail: err }), 502)
		}

		const anthropicData = await anthropicResp.json() as { content: { text: string }[] }
		let raw = anthropicData.content?.[0]?.text || ''

		// Strip markdown fences if present
		raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
		const jsonStart = raw.indexOf('{')
		const jsonEnd = raw.lastIndexOf('}')
		if (jsonStart > -1 && jsonEnd > jsonStart) raw = raw.substring(jsonStart, jsonEnd + 1)
		raw = raw.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')

		// Validate it's parseable before returning
		try {
			JSON.parse(raw)
		} catch {
			return cors(JSON.stringify({ error: 'AI returned malformed JSON', raw }), 502)
		}

		return cors(raw)
	},
}
