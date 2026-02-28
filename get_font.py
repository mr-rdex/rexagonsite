import urllib.request
try:
    req = urllib.request.Request(
        'https://fonts.cdnfonts.com/css/minecraft-4',
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
