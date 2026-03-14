import sys
p = 'js/analyzer.js'
try:
    s = open(p, encoding='utf-8').read()
except Exception as e:
    print('ERROR', e); sys.exit(2)
stack = []
pairs = {'{':'}','(':')','[':']'}
for i,ch in enumerate(s):
    if ch in pairs:
        stack.append((ch,i))
    elif ch in pairs.values():
        if not stack:
            print('Unmatched closing',ch,'at',i)
            sys.exit(1)
        o,oi = stack.pop()
        if pairs[o] != ch:
            print('Mismatched',o,'at',oi,'with',ch,'at',i)
            sys.exit(1)
if stack:
    print('Unmatched openings remain:')
    for o,oi in stack[-10:]:
        print(o,oi)
    sys.exit(1)
print('All brackets appear balanced')
