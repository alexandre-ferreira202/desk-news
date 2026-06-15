const fs = require('fs');
let content = fs.readFileSync('src/routes/espelho.tsx', 'utf8');

// Replace the invocation
const oldInvocation = `<CabecaEditorModal
          item={modalCabeca}
          onClose={() => setModalCabeca(null)}
          onSave={async (id, cabeca, tempo) => {
            await updateItem(id, { cabeca, tempo_cab: tempo });
            setModalCabeca(null);
          }}
        />`;

const newInvocation = `<CabecaEditorModal
          item={modalCabeca}
          materia={materias.find(m => m.id === modalCabeca.materia_id)}
          onClose={() => setModalCabeca(null)}
          onSave={async (id, assunto, cabeca, tempoCab, tempoVt) => {
            await updateItem(id, { assunto, cabeca, tempo_cab: tempoCab, tempo: tempoVt });
            setModalCabeca(null);
          }}
        />`;

content = content.replace(oldInvocation, newInvocation);

const newModal = `function CabecaEditorModal({ 
  item, 
  materia,
  onClose, 
  onSave 
}: { 
  item: Item, 
  materia?: Materia,
  onClose: () => void, 
  onSave: (id: string, assunto: string, cabeca: string, tempoCab: string, tempoVt: string) => void 
}) {
  const [assunto, setAssunto] = useState(item.assunto || "");
  const [text, setText] = useState(item.cabeca || "");
  const [tempoCab, setTempoCab] = useState(item.tempo_cab || "0:00");
  const [tempoVt, setTempoVt] = useState(item.tempo || "0:00");
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const words = newText.trim().split(/\\s+/).filter(w => w.length > 0).length;
    const sec = Math.ceil((words / 130) * 60);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    setTempoCab(\`\${String(m).padStart(2, "0")}:\${String(s).padStart(2, "0")}\`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-border/50">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1.5">Estrutura da Matéria</div>
            <input 
              value={assunto}
              onChange={e => setAssunto(e.target.value)}
              className="w-full bg-transparent text-xl font-bold focus:outline-none focus:ring-0 focus:border-b border-primary/50 border-b border-transparent transition-colors uppercase"
              placeholder="RETRANCA / ASSUNTO"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onSave(item.id, assunto, text, tempoCab, tempoVt)} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Salvar">
              <Pencil className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Fechar">
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border/50 rounded p-4 bg-background/50">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tempo (Cab + VT)</div>
              <div className="flex items-center font-mono text-lg gap-2">
                <input 
                  value={tempoCab} 
                  onChange={(e) => setTempoCab(e.target.value)} 
                  className="w-16 bg-transparent text-center focus:outline-none focus:border-b border-primary/50 border-b border-transparent transition-colors"
                />
                <span className="text-muted-foreground">+</span>
                <input 
                  value={tempoVt} 
                  onChange={(e) => setTempoVt(e.target.value)} 
                  className="w-16 bg-transparent text-center focus:outline-none focus:border-b border-primary/50 border-b border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="border border-border/50 rounded p-4 bg-background/50">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Repórter</div>
              <div className="mt-1.5 text-base">{materia?.credito_reporter ?? "—"}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Cabeça do Âncora</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Palavras: <span className="font-bold text-foreground">{text.trim().split(/\\s+/).filter(w => w.length > 0).length}</span></div>
            </div>
            <div className="flex">
              <div className="w-0.5 bg-primary rounded-l-sm mr-4 opacity-80"></div>
              <textarea 
                value={text} 
                onChange={handleTextChange} 
                className="w-full h-32 bg-transparent italic text-base focus:outline-none resize-none leading-relaxed text-foreground"
                placeholder="Digite a cabeça do âncora aqui..."
                autoFocus
              />
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button onClick={() => onSave(item.id, assunto, text, tempoCab, tempoVt)} className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded shadow-lg hover:bg-primary/90 transition-colors">
              SALVAR E FECHAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const splitIdx = content.indexOf('function CabecaEditorModal');
if (splitIdx !== -1) {
    content = content.substring(0, splitIdx) + newModal;
    fs.writeFileSync('src/routes/espelho.tsx', content);
    console.log("Success");
} else {
    console.log("Could not find function CabecaEditorModal");
}
