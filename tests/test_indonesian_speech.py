import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from indonesian_speech import LETTER_SPEECH, letter_text, prepare_text, speech_key


class PronunciationTests(unittest.TestCase):
    def test_suffixes_do_not_split_words(self):
        self.assertEqual(prepare_text('Yesus dan murid-murid-Nya. Bapa-Ku. Nama-Mu.'), 'Yesus dan murid-muridnya. Bapaku. Namamu.')

    def test_preserves_names_and_meaning(self):
        self.assertEqual(prepare_text('Yesus pergi ke Betlehem dan Sungai Yordan'), 'Yesus pergi ke Betlehem dan Sungai Yordan.')

    def test_punctuation_and_letter_e(self):
        self.assertEqual(prepare_text('Mari…  ikut Aku!'), 'Mari. ikut Aku!')
        self.assertEqual(LETTER_SPEECH['e'], 'é')
        self.assertNotEqual(speech_key('Yesus.'), speech_key('Yusuf.'))

    def test_letter_names_are_spoken_without_intro(self):
        self.assertEqual(letter_text('be'), 'bé.')
        self.assertEqual(letter_text('we'), 'wé.')
        self.assertEqual(letter_text('ef'), 'éf.')
        self.assertEqual(letter_text('a'), 'a.')


if __name__ == '__main__':
    unittest.main()
