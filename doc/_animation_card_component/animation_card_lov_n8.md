Adicionei o efeito “mancha roxa seguindo o mouse” e apliquei em um card de teste na aba de clientes, mantendo o LavaLamp e o restante do layout.
O que foi feito
src/index.css
Incluí variáveis --brand e --brand-2.
Criei a classe .hero-spotlight com dois radial-gradients e transição suave.
src/features/customers/components/CustomersLite.tsx
Substituí o card da nova tabela por uma seção com classe hero-spotlight.
No onMouseMove, atualizo --x e --y em porcentagem para mover o centro do gradiente.
Mantive o conteúdo do card com ContributorsTable.
Como testar
Abra Clientes, mova o mouse sobre o card “Projetos e Contribuidores (demo)”. A mancha roxa acompanhará o cursor; um glow azul sutil fica no topo do card.
Ajustes rápidos (se quiser)
Tamanho do halo: no CSS, mude 600px.
Difusão: ajuste transparent 40%.
Intensidade: altere / 0.18 ou / 0.12.
Posição do glow: altere 50% -10% do segundo gradiente.
Acessibilidade/Perf
Se desejar, posso adicionar prefers-reduced-motion e otimizar o handler para pointermove com requestAnimationFrame.


Aplicado globalmente.
src/index.css: inclui --brand, --brand-2 e a classe .hero-spotlight (dois radial-gradients e transição).
src/shared/ui/primitives/card.tsx: todos os Card agora usam a classe hero-spotlight e atualizam --x/--y no onMouseMove. Assim, qualquer card (relatórios, inventário, clientes, etc.) terá o efeito.
Notas
O efeito responde por card, sem tocar na animação LavaLamp.
Se quiser desativar em um card específico, passe className="not-spotlight" e eu posso ajustar o Card para condicional (ex.: ignorar onMouseMove quando not-spotlight estiver presente).
Posso também adicionar prefers-reduced-motion para reduzir a transição ou desabilitar a animação em usuários sensíveis.