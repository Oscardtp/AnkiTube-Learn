import re
with open('page.tsx', 'r') as f:
    d = f.read()
s = d.find('</div>\n\n               <div className="flex flex-col sm:flex-row gap-3 mt-4">')
e = d.find('{generationError && (', s)
with open('page.tsx', 'w') as f:
    f.write(d[:s+71] + d[e:])
print('removed' if s > 0 else 'not found')
