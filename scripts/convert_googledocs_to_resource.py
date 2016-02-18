import csv
import gspread
import codecs
import os

username = 'david.gunzinger@gmail.com'
password = 'mvyfrltoiqovgijz'

docid = "1_8oaRhbul_77riORtZ5Qx8En8hjcZG44sZCq2RjMZSw"

client = gspread.login(username, password)
spreadsheet = client.open_by_key(docid)

langs = ['de','fr','it','en']
files = [codecs.open("%s/../po/%s.po"%(os.path.dirname(os.path.realpath(__file__)),i),"wb",encoding="utf-8-sig") for i in langs] 


for i,fd in enumerate(files):
  fd.write('msgid ""\nmsgstr ""\n"Language: %s\\n"\n"Content-Type: text/plain; charset=UTF-8\\n"\n"Content-Transfer-Encoding: 8bit\\n"\n\n'%langs[i])




for i, worksheet in enumerate(spreadsheet.worksheets()):
    rows = worksheet.get_all_values()
    for row in rows[1:]:
      for i,fd in enumerate(files):
        fd.write(u'msgid "%s"\n'%row[1].replace("\"","\\\""))
        fd.write(u'msgstr "%s"\n'%row[2+i].replace("\"","\\\"").replace("\n","\\n"))
        fd.write('\n')
        

for fd in files:
    fd.close()

