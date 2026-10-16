# NoClipCode Privacy Contract

Regra permanente: se algo pode ser processado no navegador, o dado do usuário nunca sai do dispositivo.

- Não enviar texto, arquivos, imagens, PDFs, QR payloads, senhas, contatos, localização, metadata, clipboard ou gravações para APIs, backends, analytics, logs ou armazenamento remoto.
- Bibliotecas, workers e WASM podem vir até o navegador; o conteúdo do usuário nunca vai até um serviço remoto.
- Não persistir conteúdo sensível automaticamente em localStorage, IndexedDB ou Cache Storage.
- Nunca colocar conteúdo sensível automaticamente em URLs. Compartilhamento de conteúdo exige ação explícita e aviso.
- Clipboard somente após gesto explícito do usuário.
- Revogar Object URLs quando substituídas ou descartadas.
- Ferramentas sensíveis devem exibir `LocalProcessingBadge`.
- QR lido é sempre exibido como texto primeiro; nunca executar ou navegar automaticamente.
- Analytics futuro pode receber apenas rota limpa, nunca query strings ou conteúdo.

Toda evolução deve incluir auditoria de rede e busca por APIs de transmissão/persistência antes da publicação.
