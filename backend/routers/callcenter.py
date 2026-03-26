"""
Call Center Training Module Router
Handles phrases, scenarios, practice sessions, and progress tracking
"""
import logging
from datetime import datetime, timedelta
from typing import Optional
from difflib import SequenceMatcher

from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from pydantic import BaseModel, Field

from database import get_db
from utils.auth import require_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/callcenter", tags=["callcenter"])


# ============ PYDANTIC MODELS ============

class ExampleDialogue(BaseModel):
    customer: str
    agent: str


class CallCenterPhrase(BaseModel):
    id: str
    english: str
    spanish: str
    phonetic: str
    category: str
    difficulty: str
    context: str
    example_dialogue: ExampleDialogue
    tips: list[str]
    audio_url: Optional[str] = None


class PracticeScenario(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    category: str
    customer_persona: str
    situation: str
    expected_responses: list[str]
    hints: list[str]


class StartPracticeRequest(BaseModel):
    scenario_id: str


class SubmitResponseRequest(BaseModel):
    session_id: str
    scenario_id: str
    user_response: str
    expected_response: str


class SubmitResponseResult(BaseModel):
    is_correct: bool
    score: int
    feedback: str
    similarity_percentage: float
    suggestions: list[str]


class SkillLevels(BaseModel):
    greetings: int = 0
    problem_solving: int = 0
    empathy: int = 0
    closing: int = 0
    pronunciation: int = 0


class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[str] = None
    progress: Optional[int] = None
    target: Optional[int] = None


class WeeklyActivity(BaseModel):
    day: str
    sessions: int
    points: int


class UserProgress(BaseModel):
    user_id: str
    total_phrases_learned: int
    total_practice_sessions: int
    current_streak: int
    longest_streak: int
    total_points: int
    level: int
    skills: SkillLevels
    achievements: list[Achievement]
    weekly_activity: list[WeeklyActivity]
    last_session_at: Optional[str]


# ============ SEED DATA ============

PHRASES_DATA = [
    {
        "id": "phrase_001",
        "english": "Thank you for calling [Company Name]. My name is [Your Name]. How may I assist you today?",
        "spanish": "Gracias por llamar a [Nombre de la Empresa]. Mi nombre es [Tu Nombre]. ¿Como puedo ayudarte hoy?",
        "phonetic": "/θæŋk juː fɔːr ˈkɔːlɪŋ/ ... /haʊ meɪ aɪ əˈsɪst juː təˈdeɪ/",
        "category": "greetings",
        "difficulty": "beginner",
        "context": "Saludo inicial estandar al contestar una llamada. Es profesional y amigable.",
        "example_dialogue": {
            "customer": "*Ring ring*",
            "agent": "Thank you for calling TechSupport Inc. My name is Maria. How may I assist you today?"
        },
        "tips": [
            "Sonrie al hablar - se nota en tu voz",
            "Habla claro y a velocidad moderada",
            "Personaliza con el nombre real de tu empresa"
        ]
    },
    {
        "id": "phrase_002",
        "english": "I understand your frustration, and I apologize for any inconvenience.",
        "spanish": "Entiendo tu frustracion y me disculpo por cualquier inconveniente.",
        "phonetic": "/aɪ ˌʌndərˈstænd jʊər frʌˈstreɪʃən/",
        "category": "empathy",
        "difficulty": "beginner",
        "context": "Frase de empatia para cuando el cliente esta molesto. Muestra que lo escuchas.",
        "example_dialogue": {
            "customer": "I've been waiting for 30 minutes! This is ridiculous!",
            "agent": "I understand your frustration, and I apologize for any inconvenience. Let me help you right away."
        },
        "tips": [
            "Usa un tono calmado y sincero",
            "No interrumpas al cliente mientras habla",
            "Sigue inmediatamente con una solucion"
        ]
    },
    {
        "id": "phrase_003",
        "english": "Could you please hold for a moment while I check that for you?",
        "spanish": "¿Podria esperar un momento mientras verifico eso por usted?",
        "phonetic": "/kʊd juː pliːz hoʊld fɔːr ə ˈmoʊmənt/",
        "category": "hold_requests",
        "difficulty": "beginner",
        "context": "Solicitar permiso educadamente para poner al cliente en espera.",
        "example_dialogue": {
            "customer": "Can you tell me when my order will arrive?",
            "agent": "Absolutely! Could you please hold for a moment while I check that for you?"
        },
        "tips": [
            "Siempre pide permiso antes de poner en espera",
            "Indica brevemente que haras durante la espera",
            "No dejes al cliente en espera mas de 2 minutos sin actualizar"
        ]
    },
    {
        "id": "phrase_004",
        "english": "Let me verify your account information. Can you please provide your account number?",
        "spanish": "Dejame verificar la informacion de tu cuenta. ¿Puedes proporcionarme tu numero de cuenta?",
        "phonetic": "/let miː ˈverɪfaɪ jʊər əˈkaʊnt ˌɪnfərˈmeɪʃən/",
        "category": "verification",
        "difficulty": "beginner",
        "context": "Verificacion de identidad del cliente antes de dar informacion sensible.",
        "example_dialogue": {
            "customer": "I need to check my balance.",
            "agent": "I'd be happy to help with that. Let me verify your account information. Can you please provide your account number?"
        },
        "tips": [
            "Explica por que necesitas verificar",
            "Se paciente si el cliente busca la informacion",
            "Confirma los datos repitiendo los ultimos digitos"
        ]
    },
    {
        "id": "phrase_005",
        "english": "I'll escalate this issue to our specialized team. They will contact you within 24 hours.",
        "spanish": "Escalare este problema a nuestro equipo especializado. Te contactaran en las proximas 24 horas.",
        "phonetic": "/aɪl ˈeskəleɪt ðɪs ˈɪʃuː/",
        "category": "escalation",
        "difficulty": "intermediate",
        "context": "Cuando necesitas transferir a un equipo especializado.",
        "example_dialogue": {
            "customer": "This technical issue is beyond basic support.",
            "agent": "I completely understand. I'll escalate this issue to our specialized team. They will contact you within 24 hours."
        },
        "tips": [
            "Se especifico sobre el tiempo de respuesta",
            "Asegurate de tener la informacion de contacto correcta",
            "Documenta bien el caso antes de escalar"
        ]
    },
    {
        "id": "phrase_006",
        "english": "Is there anything else I can help you with today?",
        "spanish": "¿Hay algo mas en lo que pueda ayudarte hoy?",
        "phonetic": "/ɪz ðer ˈeniθɪŋ els aɪ kæn help juː wɪð təˈdeɪ/",
        "category": "closing",
        "difficulty": "beginner",
        "context": "Pregunta de cierre para asegurar que el cliente no tiene mas dudas.",
        "example_dialogue": {
            "customer": "Great, that solved my problem!",
            "agent": "I'm glad I could help! Is there anything else I can help you with today?"
        },
        "tips": [
            "Espera la respuesta del cliente",
            "Si dice no, procede al cierre final",
            "Manten el tono amigable hasta el final"
        ]
    },
    {
        "id": "phrase_007",
        "english": "I apologize, but I'm not able to process that request. However, I can offer you an alternative.",
        "spanish": "Me disculpo, pero no puedo procesar esa solicitud. Sin embargo, puedo ofrecerte una alternativa.",
        "phonetic": "/aɪ əˈpɒlədʒaɪz bʌt aɪm nɒt ˈeɪbəl tuː ˈprəʊses/",
        "category": "problem_solving",
        "difficulty": "intermediate",
        "context": "Cuando no puedes hacer exactamente lo que el cliente pide pero tienes opciones.",
        "example_dialogue": {
            "customer": "I want a full refund even though it's past the return window.",
            "agent": "I apologize, but I'm not able to process that request. However, I can offer you store credit or an exchange."
        },
        "tips": [
            "Nunca digas solo 'no' - siempre ofrece alternativas",
            "Explica brevemente la razon si es apropiado",
            "Enfocate en lo que SI puedes hacer"
        ]
    },
    {
        "id": "phrase_008",
        "english": "Thank you for your patience. I have resolved the issue. Here's what I did...",
        "spanish": "Gracias por tu paciencia. He resuelto el problema. Esto es lo que hice...",
        "phonetic": "/θæŋk juː fɔːr jʊər ˈpeɪʃəns/",
        "category": "resolution",
        "difficulty": "intermediate",
        "context": "Agradecer la paciencia y explicar la solucion implementada.",
        "example_dialogue": {
            "customer": "*After waiting*",
            "agent": "Thank you for your patience. I have resolved the issue. Here's what I did: I've updated your shipping address and expedited your order."
        },
        "tips": [
            "Siempre explica que hiciste",
            "Confirma que el problema esta resuelto",
            "Da pasos de seguimiento si aplica"
        ]
    },
    {
        "id": "phrase_009",
        "english": "I want to make sure I understand correctly. You're saying that...",
        "spanish": "Quiero asegurarme de entender correctamente. Estas diciendo que...",
        "phonetic": "/aɪ wɒnt tuː meɪk ʃʊər aɪ ˌʌndərˈstænd kəˈrektli/",
        "category": "active_listening",
        "difficulty": "intermediate",
        "context": "Tecnica de escucha activa para confirmar que entendiste el problema.",
        "example_dialogue": {
            "customer": "The app crashes when I try to upload photos and then my data disappears.",
            "agent": "I want to make sure I understand correctly. You're saying that when you attempt to upload photos, the app crashes and you lose your data?"
        },
        "tips": [
            "Parafrasea lo que el cliente dijo",
            "Usa tus propias palabras, no repitas exactamente",
            "Espera confirmacion antes de continuar"
        ]
    },
    {
        "id": "phrase_010",
        "english": "Thank you for calling. Have a great day!",
        "spanish": "Gracias por llamar. ¡Que tengas un excelente dia!",
        "phonetic": "/θæŋk juː fɔːr ˈkɔːlɪŋ hæv ə ɡreɪt deɪ/",
        "category": "closing",
        "difficulty": "beginner",
        "context": "Despedida final profesional y amigable.",
        "example_dialogue": {
            "customer": "No, that's all. Thanks for your help!",
            "agent": "You're welcome! Thank you for calling. Have a great day!"
        },
        "tips": [
            "Termina con energia positiva",
            "Espera que el cliente cuelgue primero",
            "Sonrie - se escucha en tu voz"
        ]
    },
    {
        "id": "phrase_011",
        "english": "I completely understand how important this is to you.",
        "spanish": "Entiendo completamente lo importante que esto es para ti.",
        "phonetic": "/aɪ kəmˈpliːtli ˌʌndərˈstænd haʊ ɪmˈpɔːrtənt/",
        "category": "empathy",
        "difficulty": "beginner",
        "context": "Validar los sentimientos del cliente y mostrar que te importa su situacion.",
        "example_dialogue": {
            "customer": "I really need this fixed today. I have a presentation tomorrow!",
            "agent": "I completely understand how important this is to you. Let me prioritize this and see what we can do right now."
        },
        "tips": [
            "Conecta emocionalmente primero",
            "Luego ofrece accion concreta",
            "Evita frases vacias como 'entiendo'"
        ]
    },
    {
        "id": "phrase_012",
        "english": "Let me walk you through the steps to resolve this.",
        "spanish": "Dejame guiarte paso a paso para resolver esto.",
        "phonetic": "/let miː wɔːk juː θruː ðə steps/",
        "category": "troubleshooting",
        "difficulty": "intermediate",
        "context": "Introducir instrucciones paso a paso para resolver un problema tecnico.",
        "example_dialogue": {
            "customer": "I don't know how to reset my password.",
            "agent": "No problem! Let me walk you through the steps to resolve this. First, go to the login page..."
        },
        "tips": [
            "Usa numeros: 'Primero... Segundo...'",
            "Espera confirmacion despues de cada paso",
            "Adapta la velocidad al cliente"
        ]
    }
]

SCENARIOS_DATA = [
    {
        "id": "scenario_001",
        "title": "Cliente con problema de facturacion",
        "description": "Un cliente llama porque le cobraron dos veces en su tarjeta.",
        "difficulty": "beginner",
        "category": "billing",
        "customer_persona": "Profesional de 35 años, ocupado, ligeramente frustrado pero educado.",
        "situation": "El cliente reviso su estado de cuenta y noto un cargo duplicado de $49.99.",
        "expected_responses": [
            "I understand your concern about the duplicate charge",
            "Let me look into this for you right away",
            "I apologize for the inconvenience this has caused",
            "I can see the duplicate charge on your account",
            "I will process a refund immediately"
        ],
        "hints": [
            "Muestra empatia primero",
            "Verifica la informacion de la cuenta",
            "Ofrece una solucion concreta"
        ]
    },
    {
        "id": "scenario_002",
        "title": "Soporte tecnico basico",
        "description": "Un cliente no puede iniciar sesion en su cuenta.",
        "difficulty": "beginner",
        "category": "technical",
        "customer_persona": "Adulto mayor de 60 años, paciente pero no muy tecnologico.",
        "situation": "El cliente olvido su contraseña y no sabe como recuperarla.",
        "expected_responses": [
            "I'd be happy to help you regain access to your account",
            "Let me guide you through the password reset process",
            "First, go to the login page",
            "Click on 'Forgot Password'",
            "You will receive an email with instructions"
        ],
        "hints": [
            "Usa lenguaje simple y claro",
            "Guia paso a paso",
            "Se paciente y repite si es necesario"
        ]
    },
    {
        "id": "scenario_003",
        "title": "Cliente muy enojado",
        "description": "Un cliente llama furioso porque su pedido llego dañado.",
        "difficulty": "intermediate",
        "category": "complaints",
        "customer_persona": "Cliente de 28 años, muy molesto, habla rapido y usa tono elevado.",
        "situation": "Recibio un paquete con el producto roto. Es la segunda vez que le pasa.",
        "expected_responses": [
            "I sincerely apologize for this experience",
            "I understand your frustration, especially since this happened before",
            "This is unacceptable and I will personally ensure we resolve this",
            "I can offer you a full refund or immediate replacement",
            "I will also add a credit to your account for the inconvenience"
        ],
        "hints": [
            "Deja que el cliente se desahogue primero",
            "Reconoce que es un problema repetido",
            "Ofrece compensacion adicional"
        ]
    },
    {
        "id": "scenario_004",
        "title": "Consulta sobre productos",
        "description": "Un cliente potencial quiere informacion sobre planes de servicio.",
        "difficulty": "beginner",
        "category": "sales",
        "customer_persona": "Emprendedor de 30 años, comparando opciones, hace muchas preguntas.",
        "situation": "Quiere saber las diferencias entre el plan basico y premium.",
        "expected_responses": [
            "I'd be happy to explain our service plans",
            "Our Basic plan includes...",
            "The Premium plan offers additional features such as...",
            "Based on your needs, I would recommend...",
            "Would you like me to set up a trial for you?"
        ],
        "hints": [
            "Escucha primero sus necesidades",
            "Destaca beneficios, no solo caracteristicas",
            "Cierra con una accion concreta"
        ]
    },
    {
        "id": "scenario_005",
        "title": "Cancelacion de servicio",
        "description": "Un cliente quiere cancelar su suscripcion.",
        "difficulty": "advanced",
        "category": "retention",
        "customer_persona": "Cliente de 40 años, decidido a cancelar, menciona razones de precio.",
        "situation": "Ha sido cliente por 2 años pero dice que encontro una opcion mas economica.",
        "expected_responses": [
            "I understand you're considering cancellation",
            "May I ask what specifically led to this decision?",
            "I value your loyalty over the past two years",
            "I can offer you a special retention discount of 20%",
            "If you still wish to cancel, I will process that for you"
        ],
        "hints": [
            "No discutas, escucha las razones",
            "Ofrece alternativas antes de procesar",
            "Si insiste, respeta su decision"
        ]
    }
]

ACHIEVEMENTS_DATA = [
    {
        "id": "first_phrase",
        "title": "Primera Frase",
        "description": "Aprendiste tu primera frase de call center",
        "icon": "star",
        "target": 1
    },
    {
        "id": "phrase_master_10",
        "title": "Aprendiz de Frases",
        "description": "Aprende 10 frases de call center",
        "icon": "book",
        "target": 10
    },
    {
        "id": "first_practice",
        "title": "Practica Iniciada",
        "description": "Completa tu primera sesion de practica",
        "icon": "play",
        "target": 1
    },
    {
        "id": "streak_3",
        "title": "Racha de 3 Dias",
        "description": "Practica 3 dias consecutivos",
        "icon": "flame",
        "target": 3
    },
    {
        "id": "streak_7",
        "title": "Semana Perfecta",
        "description": "Practica 7 dias consecutivos",
        "icon": "trophy",
        "target": 7
    },
    {
        "id": "points_100",
        "title": "Centurion",
        "description": "Acumula 100 puntos",
        "icon": "zap",
        "target": 100
    },
    {
        "id": "points_500",
        "title": "Medio Millar",
        "description": "Acumula 500 puntos",
        "icon": "award",
        "target": 500
    },
    {
        "id": "empathy_master",
        "title": "Maestro de Empatia",
        "description": "Domina todas las frases de empatia",
        "icon": "heart",
        "target": 5
    }
]


# ============ HELPER FUNCTIONS ============

def calculate_similarity(str1: str, str2: str) -> float:
    """Calculate similarity between two strings."""
    str1_lower = str1.lower().strip()
    str2_lower = str2.lower().strip()
    return SequenceMatcher(None, str1_lower, str2_lower).ratio() * 100


def calculate_level(points: int) -> int:
    """Calculate user level based on points."""
    if points < 100:
        return 1
    elif points < 300:
        return 2
    elif points < 600:
        return 3
    elif points < 1000:
        return 4
    elif points < 1500:
        return 5
    else:
        return 6 + (points - 1500) // 500


async def get_or_create_progress(db, user_id: str) -> dict:
    """Get or create user progress document."""
    progress = await db.callcenter_progress.find_one({"user_id": user_id})
    
    if not progress:
        # Create default progress
        progress = {
            "user_id": user_id,
            "total_phrases_learned": 0,
            "total_practice_sessions": 0,
            "current_streak": 0,
            "longest_streak": 0,
            "total_points": 0,
            "skills": {
                "greetings": 0,
                "problem_solving": 0,
                "empathy": 0,
                "closing": 0,
                "pronunciation": 0
            },
            "learned_phrases": [],
            "completed_scenarios": [],
            "weekly_activity": [],
            "last_session_at": None,
            "created_at": datetime.utcnow()
        }
        await db.callcenter_progress.insert_one(progress)
    
    return progress


async def update_streak(db, user_id: str, progress: dict) -> dict:
    """Update user streak based on last session."""
    now = datetime.utcnow()
    last_session = progress.get("last_session_at")
    
    if last_session:
        if isinstance(last_session, str):
            last_session = datetime.fromisoformat(last_session.replace("Z", "+00:00"))
        
        days_diff = (now.date() - last_session.date()).days
        
        if days_diff == 0:
            # Same day, no change to streak
            pass
        elif days_diff == 1:
            # Consecutive day, increment streak
            progress["current_streak"] = progress.get("current_streak", 0) + 1
            if progress["current_streak"] > progress.get("longest_streak", 0):
                progress["longest_streak"] = progress["current_streak"]
        else:
            # Streak broken
            progress["current_streak"] = 1
    else:
        progress["current_streak"] = 1
        progress["longest_streak"] = max(1, progress.get("longest_streak", 0))
    
    progress["last_session_at"] = now
    
    await db.callcenter_progress.update_one(
        {"user_id": user_id},
        {"$set": {
            "current_streak": progress["current_streak"],
            "longest_streak": progress["longest_streak"],
            "last_session_at": progress["last_session_at"]
        }}
    )
    
    return progress


def check_achievements(progress: dict) -> list[Achievement]:
    """Check which achievements user has unlocked."""
    achievements = []
    
    for ach_data in ACHIEVEMENTS_DATA:
        ach = Achievement(
            id=ach_data["id"],
            title=ach_data["title"],
            description=ach_data["description"],
            icon=ach_data["icon"],
            unlocked=False,
            target=ach_data["target"]
        )
        
        # Check conditions
        if ach_data["id"] == "first_phrase":
            ach.progress = progress.get("total_phrases_learned", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        elif ach_data["id"] == "phrase_master_10":
            ach.progress = progress.get("total_phrases_learned", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        elif ach_data["id"] == "first_practice":
            ach.progress = progress.get("total_practice_sessions", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        elif ach_data["id"] == "streak_3":
            ach.progress = progress.get("current_streak", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        elif ach_data["id"] == "streak_7":
            ach.progress = progress.get("current_streak", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        elif ach_data["id"] == "points_100":
            ach.progress = progress.get("total_points", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        elif ach_data["id"] == "points_500":
            ach.progress = progress.get("total_points", 0)
            ach.unlocked = ach.progress >= ach_data["target"]
        
        achievements.append(ach)
    
    return achievements


# ============ ENDPOINTS ============

@router.get("/phrases")
async def get_phrases(
    current_user: dict = Depends(require_auth),
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0)
):
    """Get call center phrases with optional filtering."""
    phrases = PHRASES_DATA.copy()
    
    if category:
        phrases = [p for p in phrases if p["category"] == category]
    
    if difficulty:
        phrases = [p for p in phrases if p["difficulty"] == difficulty]
    
    total = len(phrases)
    phrases = phrases[offset:offset + limit]
    
    return {
        "phrases": [CallCenterPhrase(**p) for p in phrases],
        "total": total
    }


@router.get("/phrases/{phrase_id}")
async def get_phrase(
    phrase_id: str,
    current_user: dict = Depends(require_auth)
):
    """Get a specific phrase by ID."""
    phrase = next((p for p in PHRASES_DATA if p["id"] == phrase_id), None)
    
    if not phrase:
        raise HTTPException(status_code=404, detail="Frase no encontrada")
    
    return CallCenterPhrase(**phrase)


@router.post("/phrases/{phrase_id}/learned")
async def mark_phrase_learned(
    phrase_id: str,
    current_user: dict = Depends(require_auth)
):
    """Mark a phrase as learned and earn points."""
    db = get_db()
    user_id = current_user["sub"]
    
    # Verify phrase exists
    phrase = next((p for p in PHRASES_DATA if p["id"] == phrase_id), None)
    if not phrase:
        raise HTTPException(status_code=404, detail="Frase no encontrada")
    
    progress = await get_or_create_progress(db, user_id)
    
    # Check if already learned
    learned_phrases = progress.get("learned_phrases", [])
    if phrase_id in learned_phrases:
        return {"message": "Ya aprendiste esta frase", "points_earned": 0}
    
    # Award points based on difficulty
    points_map = {"beginner": 10, "intermediate": 15, "advanced": 20}
    points_earned = points_map.get(phrase["difficulty"], 10)
    
    # Update progress
    learned_phrases.append(phrase_id)
    
    # Update skill based on category
    skills = progress.get("skills", {})
    category_skill_map = {
        "greetings": "greetings",
        "empathy": "empathy",
        "closing": "closing",
        "problem_solving": "problem_solving",
        "hold_requests": "greetings",
        "verification": "problem_solving",
        "escalation": "problem_solving",
        "resolution": "problem_solving",
        "active_listening": "empathy",
        "troubleshooting": "problem_solving"
    }
    skill_key = category_skill_map.get(phrase["category"], "greetings")
    skills[skill_key] = skills.get(skill_key, 0) + 5
    
    await db.callcenter_progress.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "learned_phrases": learned_phrases,
                "skills": skills
            },
            "$inc": {
                "total_phrases_learned": 1,
                "total_points": points_earned
            }
        }
    )
    
    # Update streak
    await update_streak(db, user_id, progress)
    
    logger.info(f"Phrase learned: {phrase_id} by user {user_id} | +{points_earned} points")
    
    return {
        "message": "¡Excelente! Frase aprendida",
        "points_earned": points_earned
    }


@router.get("/scenarios")
async def get_scenarios(
    current_user: dict = Depends(require_auth),
    category: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Get practice scenarios with optional filtering."""
    scenarios = SCENARIOS_DATA.copy()
    
    if category:
        scenarios = [s for s in scenarios if s["category"] == category]
    
    if difficulty:
        scenarios = [s for s in scenarios if s["difficulty"] == difficulty]
    
    return {
        "scenarios": [PracticeScenario(**s) for s in scenarios],
        "total": len(scenarios)
    }


@router.get("/scenarios/{scenario_id}")
async def get_scenario(
    scenario_id: str,
    current_user: dict = Depends(require_auth)
):
    """Get a specific scenario by ID."""
    scenario = next((s for s in SCENARIOS_DATA if s["id"] == scenario_id), None)
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    
    return PracticeScenario(**scenario)


@router.post("/practice/start")
async def start_practice_session(
    payload: StartPracticeRequest,
    current_user: dict = Depends(require_auth)
):
    """Start a new practice session."""
    db = get_db()
    user_id = current_user["sub"]
    
    # Verify scenario exists
    scenario = next((s for s in SCENARIOS_DATA if s["id"] == payload.scenario_id), None)
    if not scenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    
    # Create session
    session_doc = {
        "user_id": user_id,
        "scenario_id": payload.scenario_id,
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "score": 0,
        "correct_responses": 0,
        "total_responses": 0,
        "feedback": []
    }
    
    result = await db.practice_sessions.insert_one(session_doc)
    
    return {
        "id": str(result.inserted_id),
        "scenario_id": payload.scenario_id,
        "started_at": session_doc["started_at"].isoformat(),
        "score": 0,
        "correct_responses": 0,
        "total_responses": 0,
        "feedback": []
    }


@router.post("/practice/submit")
async def submit_practice_response(
    payload: SubmitResponseRequest,
    current_user: dict = Depends(require_auth)
):
    """Submit a response during practice session."""
    db = get_db()
    user_id = current_user["sub"]
    
    # Verify session exists and belongs to user
    try:
        session = await db.practice_sessions.find_one({
            "_id": ObjectId(payload.session_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(status_code=400, detail="ID de sesion invalido")
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesion no encontrada")
    
    # Calculate similarity
    similarity = calculate_similarity(payload.user_response, payload.expected_response)
    is_correct = similarity >= 60  # 60% threshold
    
    # Calculate score based on similarity
    if similarity >= 90:
        score = 20
        feedback = "¡Excelente! Respuesta perfecta."
    elif similarity >= 75:
        score = 15
        feedback = "¡Muy bien! Tu respuesta es muy buena."
    elif similarity >= 60:
        score = 10
        feedback = "Bien. Puedes mejorar un poco la precision."
    else:
        score = 5
        feedback = "Sigue practicando. Revisa la respuesta esperada."
    
    # Generate suggestions
    suggestions = []
    if similarity < 90:
        suggestions.append("Intenta usar frases mas similares a las esperadas")
        if "sorry" not in payload.user_response.lower() and "apologize" in payload.expected_response.lower():
            suggestions.append("Recuerda incluir una disculpa cuando sea apropiado")
        if len(payload.user_response.split()) < len(payload.expected_response.split()) * 0.5:
            suggestions.append("Tu respuesta podria ser mas completa")
    
    # Update session
    await db.practice_sessions.update_one(
        {"_id": ObjectId(payload.session_id)},
        {
            "$inc": {
                "score": score,
                "correct_responses": 1 if is_correct else 0,
                "total_responses": 1
            },
            "$push": {"feedback": feedback}
        }
    )
    
    return SubmitResponseResult(
        is_correct=is_correct,
        score=score,
        feedback=feedback,
        similarity_percentage=round(similarity, 1),
        suggestions=suggestions
    )


@router.post("/practice/{session_id}/complete")
async def complete_practice_session(
    session_id: str,
    current_user: dict = Depends(require_auth)
):
    """Complete a practice session and award points."""
    db = get_db()
    user_id = current_user["sub"]
    
    try:
        session = await db.practice_sessions.find_one({
            "_id": ObjectId(session_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(status_code=400, detail="ID de sesion invalido")
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesion no encontrada")
    
    if session.get("completed_at"):
        raise HTTPException(status_code=409, detail="Esta sesion ya fue completada")
    
    # Mark session as complete
    await db.practice_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"completed_at": datetime.utcnow()}}
    )
    
    # Update user progress
    progress = await get_or_create_progress(db, user_id)
    
    await db.callcenter_progress.update_one(
        {"user_id": user_id},
        {
            "$inc": {
                "total_practice_sessions": 1,
                "total_points": session["score"]
            }
        }
    )
    
    # Update streak
    await update_streak(db, user_id, progress)
    
    # Check for new achievements
    updated_progress = await get_or_create_progress(db, user_id)
    achievements = check_achievements(updated_progress)
    unlocked = [a for a in achievements if a.unlocked]
    
    logger.info(f"Practice session completed: {session_id} | user: {user_id} | score: {session['score']}")
    
    return {
        "session": {
            "id": session_id,
            "scenario_id": session["scenario_id"],
            "started_at": session["started_at"].isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "score": session["score"],
            "correct_responses": session["correct_responses"],
            "total_responses": session["total_responses"],
            "feedback": session["feedback"]
        },
        "points_earned": session["score"],
        "achievements_unlocked": unlocked
    }


@router.get("/progress")
async def get_user_progress(
    current_user: dict = Depends(require_auth)
):
    """Get user's call center training progress."""
    db = get_db()
    user_id = current_user["sub"]
    
    progress = await get_or_create_progress(db, user_id)
    achievements = check_achievements(progress)
    
    # Calculate level
    level = calculate_level(progress.get("total_points", 0))
    
    # Get weekly activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_activity = []
    
    for i in range(7):
        day = week_ago + timedelta(days=i)
        day_name = day.strftime("%a")
        
        # Count sessions for that day
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        sessions_count = await db.practice_sessions.count_documents({
            "user_id": user_id,
            "started_at": {"$gte": day_start, "$lt": day_end}
        })
        
        weekly_activity.append({
            "day": day_name,
            "sessions": sessions_count,
            "points": sessions_count * 15  # Approximate
        })
    
    return UserProgress(
        user_id=user_id,
        total_phrases_learned=progress.get("total_phrases_learned", 0),
        total_practice_sessions=progress.get("total_practice_sessions", 0),
        current_streak=progress.get("current_streak", 0),
        longest_streak=progress.get("longest_streak", 0),
        total_points=progress.get("total_points", 0),
        level=level,
        skills=SkillLevels(**progress.get("skills", {})),
        achievements=achievements,
        weekly_activity=[WeeklyActivity(**a) for a in weekly_activity],
        last_session_at=progress["last_session_at"].isoformat() if progress.get("last_session_at") else None
    )


@router.get("/achievements")
async def get_achievements(
    current_user: dict = Depends(require_auth)
):
    """Get user's achievements."""
    db = get_db()
    user_id = current_user["sub"]
    
    progress = await get_or_create_progress(db, user_id)
    achievements = check_achievements(progress)
    
    unlocked_count = sum(1 for a in achievements if a.unlocked)
    
    return {
        "achievements": achievements,
        "total_unlocked": unlocked_count
    }
