import sys
import subprocess
try:
    import PyPDF2
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'PyPDF2'])
    import PyPDF2

reader = PyPDF2.PdfReader('c:/xampp/htdocs/bolao-entre-amigos/public/tabela.pdf')
with open('extracted_tabela.txt', 'w', encoding='utf-8') as f:
    for p in reader.pages:
        f.write(p.extract_text() + '\n')
