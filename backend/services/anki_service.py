"""
Anki deck generation service.
Generates .apkg files with audio embedded using genanki.
Phase 1: audio_filename is empty (no yt-dlp yet). Phase 2: audio is embedded.
"""

import genanki
import os
import tempfile
import logging

from models.deck import Card

logger = logging.getLogger(__name__)

# Stable model IDs — must not change between generations or Anki gets confused
ANKITUBE_VOCAB_MODEL_ID = 1607392319
ANKITUBE_PHRASE_MODEL_ID = 1607392320


def _create_vocab_model() -> genanki.Model:
    """Model for vocabulary cards (fill-in-the-blank compatible)."""
    return genanki.Model(
        ANKITUBE_VOCAB_MODEL_ID,
        "AnkiTube — Vocabulario",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
            {"name": "Keyword"},
            {"name": "GrammarNote"},
            {"name": "ContextNote"},
            {"name": "ColombianNote"},
            {"name": "Audio"},
            {"name": "CardType"},
        ],
        templates=[
            {
                "name": "AnkiTube Card",
                "qfmt": """
<div class="ankitube-card front">
  <div class="phrase">{{Front}}</div>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
</div>
""",
                "afmt": """
<div class="ankitube-card back">
  <div class="phrase">{{Front}}</div>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  <hr>
  <div class="translation">{{Back}}</div>
  <div class="keyword">🔑 <b>{{Keyword}}</b></div>
  <div class="grammar">📚 {{GrammarNote}}</div>
  <div class="context">💬 {{ContextNote}}</div>
  <div class="colombian">🇨🇴 {{ColombianNote}}</div>
</div>
""",
            }
        ],
        css="""
.ankitube-card {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}
.phrase { font-size: 22px; font-weight: bold; margin-bottom: 16px; color: #1A56DB; }
.translation { font-size: 20px; margin: 12px 0; }
.keyword { font-size: 15px; color: #6B7280; margin: 8px 0; }
.grammar { font-size: 14px; color: #374151; margin: 6px 0; text-align: left; }
.context { font-size: 14px; color: #374151; margin: 6px 0; text-align: left; }
.colombian { font-size: 14px; color: #10B981; margin: 6px 0; text-align: left; background: #F0FDF4; padding: 8px; border-radius: 6px; }
hr { border: 1px solid #E5E7EB; margin: 16px 0; }
""",
    )


def _create_phrase_model() -> genanki.Model:
    """Model for phrase/idiom cards (flip 3D compatible)."""
    return genanki.Model(
        ANKITUBE_PHRASE_MODEL_ID,
        "AnkiTube — Frases",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
            {"name": "Keyword"},
            {"name": "GrammarNote"},
            {"name": "ContextNote"},
            {"name": "ColombianNote"},
            {"name": "Audio"},
            {"name": "CardType"},
        ],
        templates=[
            {
                "name": "AnkiTube Phrase",
                "qfmt": """
<div class="ankitube-card front">
  <div class="phrase">{{Front}}</div>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
</div>
""",
                "afmt": """
<div class="ankitube-card back">
  <div class="phrase">{{Front}}</div>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  <hr>
  <div class="translation">{{Back}}</div>
  <div class="grammar">📚 {{GrammarNote}}</div>
  <div class="context">💬 {{ContextNote}}</div>
  <div class="colombian">🇨🇴 {{ColombianNote}}</div>
</div>
""",
            }
        ],
        css="""
.ankitube-card {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}
.phrase { font-size: 22px; font-weight: bold; margin-bottom: 16px; color: #1A56DB; }
.translation { font-size: 20px; margin: 12px 0; }
.grammar { font-size: 14px; color: #374151; margin: 6px 0; text-align: left; }
.context { font-size: 14px; color: #374151; margin: 6px 0; text-align: left; }
.colombian { font-size: 14px; color: #10B981; margin: 6px 0; text-align: left; background: #F0FDF4; padding: 8px; border-radius: 6px; }
hr { border: 1px solid #E5E7EB; margin: 16px 0; }
""",
    )


def generate_apkg(
    deck_id: str,
    video_title: str,
    cards: list[Card],
    audio_files: dict[str, str] | None = None,
) -> bytes:
    """
    Generate a .apkg file from a list of Card objects.

    Args:
        deck_id: MongoDB deck ID (used as deck name suffix)
        video_title: Video title for deck name
        cards: List of validated Card objects
        audio_files: Optional dict mapping audio_filename to temp file path (Phase 2)

    Returns:
        .apkg file as bytes
    """
    deck_name = f"AnkiTube — {video_title[:50]}"
    stable_deck_id = abs(hash(deck_id)) % (10**10)

    anki_deck = genanki.Deck(stable_deck_id, deck_name)
    vocab_model = _create_vocab_model()
    phrase_model = _create_phrase_model()

    media_files = []

    for card in cards:
        audio_tag = ""
        if card.audio_filename and audio_files and card.audio_filename in audio_files:
            audio_tag = f"[sound:{card.audio_filename}]"
            media_files.append(audio_files[card.audio_filename])

        # Choose model based on card_type
        if card.card_type == "vocabulary":
            model = vocab_model
        else:
            model = phrase_model

        note = genanki.Note(
            model=model,
            fields=[
                card.front,
                card.back,
                card.keyword,
                card.grammar_note,
                card.context_note,
                card.colombian_note,
                audio_tag,
                card.card_type,
            ],
            tags=["ankitube", card.card_type],
        )
        anki_deck.add_note(note)

    with tempfile.NamedTemporaryFile(suffix=".apkg", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        package = genanki.Package(anki_deck)
        if media_files:
            package.media_files = media_files
        package.write_to_file(tmp_path)

        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)