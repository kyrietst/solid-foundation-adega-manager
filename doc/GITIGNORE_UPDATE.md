# Atualização do .gitignore para Backups

Para garantir que os arquivos de backup não sejam incluídos no controle de versão, adicione as seguintes linhas ao final do arquivo `.gitignore`:

```
# Backups
backups/
*.sql
*.dump
```

Isso garantirá que:
1. A pasta `backups/` seja ignorada pelo Git
2. Arquivos SQL (usados pelos backups) não sejam incluídos
3. Arquivos de dump de banco de dados também sejam ignorados

## Importância

É crucial não incluir backups de banco de dados no controle de versão por vários motivos:

1. **Segurança**: Os backups podem conter dados sensíveis
2. **Tamanho**: Arquivos de backup podem ser muito grandes
3. **Irrelevância**: Backups são específicos para cada ambiente e não devem ser compartilhados

## Como Atualizar o .gitignore

Execute o seguinte comando no terminal para adicionar as regras de backup ao .gitignore:

```bash
echo -e "\n# Backups\nbackups/\n*.sql\n*.dump" >> .gitignore
```

Para Windows (PowerShell):

```powershell
Add-Content -Path .gitignore -Value "`n# Backups`nbackups/`n*.sql`n*.dump"
``` 