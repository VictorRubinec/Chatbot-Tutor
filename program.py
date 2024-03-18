from openai import OpenAI
import json
import sounddevice as sd
import soundfile as sf

key = json.load(open('key.json'))['key']
client = OpenAI(api_key=key)

def record_audio(file_name, duration=5, sample_rate=44100):
    print("Gravando...")
    audio_data = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='int16')
    sd.wait()
    sf.write(file_name, audio_data, sample_rate)
    print("Gravação concluída")
    
def converter_audio_texto(file_name):
    print("Convertendo áudio para texto...")
    audio_file= open("record.wav", "rb")
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
    
lista_mensagens =[
    {"role": "system", "content": "Você é um assistente narrador."}
]
    
while True:
    print("Aperter enter para gravar um áudio ou digite 'sair' para sair")
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
