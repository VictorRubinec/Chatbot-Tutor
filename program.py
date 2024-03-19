import json
import sounddevice as sd
import soundfile as sf
from google.cloud import texttospeech
from openai import OpenAI

openai_key = json.load(open('openai.json'))['key']
gctts_key = "gctts.json"
client = OpenAI(api_key=openai_key)

def record_audio(file_name, duration=10, sample_rate=44100):
    print("Gravando...")
    audio_data = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='int16')
    sd.wait()
    sf.write(file_name, audio_data, sample_rate)
    print("Gravação concluída")
    
def converter_audio_texto(file_name):
    print("Convertendo áudio para texto...")
    audio_file= open(file_name, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
    )
    return transcription.text

def enviar_mensagem(lista_mensagens):    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=lista_mensagens
    )
    return response.choices[0].message.content

def falar_resposta(resposta, output_file):    
    client = texttospeech.TextToSpeechClient.from_service_account_json(gctts_key)
    synthesis_input = texttospeech.SynthesisInput(text=resposta)

    voice = texttospeech.VoiceSelectionParams(
        language_code="pt-BR",
        name="pt-BR-Standard-B",
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.15,
        pitch=-4.5,
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    with open(output_file, "wb") as out:
        out.write(response.audio_content)
        
    audio_data, sample_rate = sf.read(output_file, dtype='float32')
    sd.play(audio_data, sample_rate)
    sd.wait()
    
    
lista_mensagens =[
    {"role": "system", "content": "Você é um funcionário da Intel que interresado em comprar processadores da empresa do usuário"},
]
    
while True:
    print("Aperte enter para gravar um áudio ou digite 'sair' para sair")
    mensagem = input()
    if mensagem == 'sair':
        break
    
    record_audio('record.wav')
    print("Áudio gravado com sucesso")
    
    mensagem = converter_audio_texto('record.wav')
    print('Você:', mensagem)
    
    lista_mensagens.append({"role": "user", "content": mensagem})
    resposta = enviar_mensagem(lista_mensagens)
    print('Bot:', resposta)
    lista_mensagens.append({"role": "assistant", "content": resposta})
    
    falar_resposta(resposta, 'resposta.wav')
