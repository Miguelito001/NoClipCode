import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | NoClipCode",
  description:
    "Política de Privacidade do NoClipCode e da extensão NoClipExtension.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        <div className="mb-12 border-b border-border pb-8">
          <p className="mb-3 font-mono text-sm text-primary">
            /privacy
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            NoClipCode + NoClipExtension · Última atualização: 6 de setembro de 2026
          </p>
        </div>

        <article className="space-y-10 leading-7 text-muted-foreground">
          <section>
            <p>
              Esta Política de Privacidade descreve como o <strong className="text-foreground">NoClipCode</strong> e a
              extensão <strong className="text-foreground">NoClipExtension</strong> tratam dados durante o uso de seus recursos.
            </p>
          </section>

          <Section title="1. NoClipExtension">
            <p>
              A NoClipExtension é uma extensão de produtividade para navegadores que oferece
              snippets personalizados e ferramentas locais de transformação de texto e dados.
            </p>

            <H3>Dados tratados pela extensão</H3>
            <p>
              Para fornecer a funcionalidade de snippets, a extensão pode acessar o conteúdo
              presente em campos de texto e editores compatíveis nas páginas visitadas pelo
              usuário. Esse acesso ocorre no navegador e é utilizado para detectar comandos de
              snippets digitados pelo próprio usuário e substituí-los pelo conteúdo configurado.
            </p>
            <p>
              A extensão não utiliza esse acesso para criar histórico de navegação, publicidade
              comportamental, criação de perfis ou venda de dados.
            </p>

            <H3>Snippets, configurações e resultados</H3>
            <p>
              Snippets personalizados, configurações e os últimos valores utilizados nas
              ferramentas da extensão são armazenados localmente no navegador por meio de
              <Code>chrome.storage.local</Code>.
            </p>
            <p>
              Esses dados permanecem no dispositivo/perfil do navegador do usuário e não são
              enviados para servidores do NoClipCode para processamento.
            </p>
            <p>
              O usuário pode remover esses dados apagando os snippets/configurações ou removendo
              os dados da extensão pelo navegador.
            </p>

            <H3>Área de transferência</H3>
            <p>
              A NoClipExtension pode escrever na área de transferência quando o usuário solicita
              uma ação de cópia. A permissão é utilizada para disponibilizar resultados gerados
              pelas ferramentas da extensão de forma rápida.
            </p>

            <H3>Ferramentas locais</H3>
            <p>
              As ferramentas incluídas na extensão, como formatação/minificação de JSON, Base64,
              URL Encode/Decode, inspeção de JWT e conversão de timestamps, são executadas
              localmente no navegador. A inspeção de JWT apenas decodifica informações do token e
              não valida sua assinatura.
            </p>

            <H3>Acesso a sites</H3>
            <p>
              A extensão precisa funcionar em diferentes sites para que os snippets possam ser
              utilizados nos campos e editores compatíveis acessados pelo usuário. Por esse
              motivo, seu pacote pode solicitar acesso amplo às páginas. O acesso é usado
              exclusivamente para fornecer as funcionalidades visíveis da extensão, especialmente
              detecção e expansão de snippets.
            </p>

            <H3>Compartilhamento e venda de dados</H3>
            <p>
              A NoClipExtension não vende dados de usuários e não transfere conteúdo de páginas,
              snippets ou valores processados pelas suas ferramentas para servidores próprios ou
              terceiros para publicidade, criação de perfis, corretagem de dados ou avaliação de
              crédito.
            </p>
            <p>
              A NoClipExtension não permite que pessoas leiam o conteúdo tratado localmente pela
              extensão, salvo quando o próprio usuário optar por compartilhar informações em uma
              solicitação de suporte.
            </p>
          </Section>

          <Section title="2. NoClipCode">
            <p>
              O NoClipCode é uma caixa de ferramentas para desenvolvedores. As ferramentas são
              projetadas para realizar suas principais transformações diretamente no navegador.
            </p>
            <p>
              O conteúdo inserido pelo usuário nas ferramentas não é enviado a servidores do
              NoClipCode para executar essas transformações, salvo se uma funcionalidade futura
              indicar expressamente o contrário antes de seu uso.
            </p>
            <p>
              A hospedagem e a infraestrutura técnica do site podem processar informações técnicas
              normalmente necessárias para entregar e proteger um serviço web, como endereço IP,
              cabeçalhos HTTP e registros técnicos, conforme as práticas e políticas dos
              respectivos provedores de infraestrutura.
            </p>
          </Section>

          <Section title="3. Analytics e métricas">
            <p>
              A presença de métricas agregadas fornecidas pela Chrome Web Store ao desenvolvedor
              não significa que a NoClipExtension envie o conteúdo digitado pelo usuário para
              serviços de analytics.
            </p>
            <p>
              Caso o NoClipCode passe a utilizar ferramentas adicionais de analytics ou telemetria
              que coletem dados dos visitantes, esta política deverá ser atualizada para identificar
              o serviço e explicar os dados tratados.
            </p>
          </Section>

          <Section title="4. Segurança e retenção">
            <p>
              Os dados funcionais da NoClipExtension descritos nesta política são mantidos
              localmente no navegador enquanto forem necessários para as preferências e
              funcionalidades escolhidas pelo usuário.
            </p>
            <p>
              Quando houver transmissão necessária de informações pelo site ou por páginas
              oficiais, serão utilizados canais HTTPS quando disponíveis.
            </p>
          </Section>

          <Section title="5. Uso limitado — Chrome Web Store">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 text-foreground">
              <p>
                O uso de dados pela NoClipExtension está limitado à disponibilização e melhoria das
                funcionalidades de produtividade descritas ao usuário.
              </p>
              <p className="mt-3">
                O uso de informações pela NoClipExtension segue a Chrome Web Store User Data
                Policy, incluindo os requisitos de Limited Use (Uso Limitado).
              </p>
              <p className="mt-3">
                Dados de usuário não são utilizados ou transferidos para publicidade personalizada,
                venda a corretores de dados, avaliação de crédito ou finalidades não relacionadas à
                finalidade única divulgada da extensão.
              </p>
            </div>
          </Section>

          <Section title="6. Serviços de terceiros e links externos">
            <p>
              O NoClipCode e a NoClipExtension podem fornecer links para serviços externos, como
              repositórios de código ou páginas de terceiros. Ao acessar esses serviços, aplicam-se
              também as políticas de privacidade dos respectivos provedores.
            </p>
          </Section>

          <Section title="7. Alterações nesta política">
            <p>
              Esta política poderá ser atualizada quando funcionalidades, permissões ou práticas de
              tratamento de dados forem alteradas. Mudanças relevantes nas práticas da extensão
              deverão ser divulgadas de forma compatível com os requisitos da Chrome Web Store.
            </p>
          </Section>

          <Section title="8. Contato">
            <p>
              Para dúvidas sobre privacidade, suporte ou funcionamento da NoClipExtension, utilize
              os canais oficiais indicados no site do NoClipCode e na página da extensão na Chrome
              Web Store.
            </p>
          </Section>
        </article>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-3 text-base font-semibold text-foreground">{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  );
}
