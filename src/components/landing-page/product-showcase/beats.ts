import type { ComponentType } from "react";

import { CompanyRegistrationScreen } from "./screens/company-registration";
import { HomeScreen } from "./screens/home";
import { PersonaBridgeScreen } from "./screens/persona-bridge";
import { MarketListScreen } from "./screens/pontos-de-coleta";
import { ProfileScreen } from "./screens/profile";
import { ReportMapScreen } from "./screens/report-map";

type ShowcaseTopic = { heading: string; body: string };

type ShowcaseBeat = {
  id: string;
  title: string;
  topics: ShowcaseTopic[];
  Component: ComponentType;
};

const BEATS: ShowcaseBeat[] = [
  {
    id: "home",
    title: "Tudo o que você precisa, num só lugar.",
    topics: [
      {
        heading: "Um ponto de entrada.",
        body: "A tela inicial já mostra os três caminhos do app: reciclagem, denúncia e cadastro de empresa, sem menu escondido, sem fluxo confuso.",
      },
      {
        heading: "Dá pra olhar antes de entrar.",
        body: "Navegar, ver pontos de coleta e entender o app não exige conta. O cadastro aparece só quando faz sentido pra você.",
      },
      {
        heading: "A tela muda com quem usa.",
        body: "Assim que alguém entra, a Home passa a mostrar endereço, indicações e atalhos que são daquela pessoa.",
      },
    ],
    Component: HomeScreen,
  },
  {
    id: "pontos-de-coleta",
    title: "Ache o ponto certo pro seu resíduo, perto de você.",
    topics: [
      {
        heading: "Busca por localização e raio.",
        body: "Filtra pela sua posição atual ou pelo endereço cadastrado, e ajusta o raio de busca, do bairro à cidade inteira.",
      },
      {
        heading: "Filtro por tipo de resíduo.",
        body: "Mostra só quem aceita o material que você tem: óleo, eletrônico, papelão, sem precisar ligar perguntando.",
      },
      {
        heading: "Simulação antes de sair de casa.",
        body: "Monta o que vai levar, confere quantidade e valor estimado com a empresa antes de qualquer negociação de verdade.",
      },
    ],
    Component: MarketListScreen,
  },
  {
    id: "report-map",
    title: "Registrou, documentou, foi encaminhado.",
    topics: [
      {
        heading: "Mapa com dados reais.",
        body: "Cada pino é uma denúncia registrada de verdade, com categoria, gravidade e distância até você.",
      },
      {
        heading: "A comunidade também participa.",
        body: "Confirmar com foto, votar e comentar dá peso coletivo ao que uma pessoa sozinha percebeu.",
      },
      {
        heading: "De olho até resolver.",
        body: "Da denúncia à resolução, tudo fica documentado. Quem fiscaliza não parte do zero.",
      },
    ],
    Component: ReportMapScreen,
  },
  {
    id: "persona-bridge",
    title: "Um app, papéis diferentes.",
    topics: [
      {
        heading: "Cidadã, coletor, empresa.",
        body: "Escolha abaixo quem você quer ser pra continuar. É assim que o app se comporta diferente pra cada tipo de pessoa.",
      },
      {
        heading: "Nada disso sai daqui.",
        body: "É só uma simulação pra você sentir o produto. Não autentica em nenhum servidor de verdade.",
      },
    ],
    Component: PersonaBridgeScreen,
  },
  {
    id: "profile",
    title: "Um perfil, dados que valem pra valer.",
    topics: [
      {
        heading: "Endereço vira geolocalização.",
        body: "É o endereço do perfil que preenche automaticamente a origem das suas denúncias e o centro da busca por pontos de coleta.",
      },
      {
        heading: "Cada papel, seu contexto.",
        body: "Cidadã, coletor, empresa: o mesmo app se comporta diferente pra cada um, a partir de um único cadastro.",
      },
      {
        heading: "Editável quando quiser.",
        body: "Nome, telefone, endereço: muda a qualquer momento, sem passar por suporte.",
      },
    ],
    Component: ProfileScreen,
  },
  {
    id: "company-registration",
    title: "Sua empresa, visível pra quem procura.",
    topics: [
      {
        heading: "CNPJ verificado na hora.",
        body: "Preenche razão social, endereço e dados públicos a partir do CNPJ, sem digitar tudo de novo.",
      },
      {
        heading: "Entra no mapa de quem recicla.",
        body: "Uma vez cadastrada, a empresa passa a aparecer na busca de Pontos de coleta, visível pra quem já está procurando o que ela recebe.",
      },
      {
        heading: "É o começo, não o fim.",
        body: "Hoje já dá pra cadastrar e gerenciar suas empresas; o próximo passo é abrir a negociação de ponta a ponta.",
      },
    ],
    Component: CompanyRegistrationScreen,
  },
];

export type { ShowcaseBeat, ShowcaseTopic };
export { BEATS };
