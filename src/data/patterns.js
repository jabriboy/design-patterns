export const patterns = [
  {
    id: "singleton",
    name: "Singleton",
    family: "Criação",
    number: "01",
    accent: "lime",
    tagline: "Um recurso compartilhado, uma única instância por processo.",
    scenario: "Controle de quota para um enlace de satélite",
    intent: "Garantir que uma classe mantenha uma única instância acessível globalmente, concentrando estado que realmente precisa ser compartilhado.",
    use: "Use quando dois módulos precisam coordenar o mesmo recurso exclusivo em um processo — por exemplo, um limitador local de chamadas a um rádio. Prefira injeção de dependência quando a instância puder ser fornecida explicitamente.",
    tradeoff: "Facilita o acesso, mas introduz estado global oculto e dificulta testes paralelos. A instância é única somente dentro daquele runtime: múltiplos processos ou réplicas precisam de coordenação externa.",
    code: String.raw`type Packet = { id: string; bytes: Uint8Array };

class UplinkQuota {
  private static instance?: UplinkQuota;
  private windowStart = Date.now();
  private sent = 0;

  private constructor(private readonly limit = 60) {}

  static shared(): UplinkQuota {
    return (this.instance ??= new UplinkQuota());
  }

  reserve(now = Date.now()): boolean {
    if (now - this.windowStart >= 60_000) {
      this.windowStart = now;
      this.sent = 0;
    }
    if (this.sent >= this.limit) return false;
    this.sent++;
    return true;
  }
}

const telemetry = UplinkQuota.shared();
const retryWorker = UplinkQuota.shared();
if (telemetry === retryWorker && telemetry.reserve()) {
  await radio.send(packet);
}`
  },
  {
    id: "factory",
    name: "Factory",
    family: "Criação",
    number: "02",
    accent: "lime",
    tagline: "Escolha a implementação sem espalhar condicionais pelo sistema.",
    scenario: "Decodificação de sensores de uma estação polar",
    intent: "Encapsular a criação de um produto e devolver uma abstração comum, deixando a decisão sobre a classe concreta em um único ponto.",
    use: "Use quando o formato ou contexto de entrada determina qual implementação criar, e o restante do fluxo só precisa da interface do produto.",
    tradeoff: "Centraliza a variação e simplifica clientes; em contrapartida, cada novo tipo exige atualizar a fábrica. Uma fábrica exageradamente genérica pode esconder dependências e virar um registro difícil de entender.",
    code: String.raw`type Feed = "csv" | "ndjson" | "protobuf";
type Reading = { station: string; celsius: number };

interface Decoder {
  decode(bytes: Uint8Array): Reading[];
}

class CsvDecoder implements Decoder {
  decode(bytes: Uint8Array): Reading[] {
    return parseCsv(new TextDecoder().decode(bytes));
  }
}
class JsonLineDecoder implements Decoder {
  decode(bytes: Uint8Array): Reading[] {
    return parseJsonLines(bytes);
  }
}
class ProtobufDecoder implements Decoder {
  decode(bytes: Uint8Array): Reading[] {
    return PolarPacket.decode(bytes).readings;
  }
}

function createDecoder(feed: Feed): Decoder {
  switch (feed) {
    case "csv": return new CsvDecoder();
    case "ndjson": return new JsonLineDecoder();
    case "protobuf": return new ProtobufDecoder();
  }
}

const decoder = createDecoder(file.feed);
const readings = decoder.decode(file.bytes);`
  },
  {
    id: "abstract-factory",
    name: "Abstract Factory",
    family: "Criação",
    number: "03",
    accent: "lime",
    tagline: "Crie famílias de componentes que já nascem compatíveis.",
    scenario: "Kits de resposta para enchentes ou terremotos",
    intent: "Definir uma interface para produzir vários objetos relacionados sem amarrar o cliente às classes concretas de uma família.",
    use: "Use quando a aplicação precisa alternar entre famílias inteiras de componentes — como abrigo, transporte e alerta — mantendo combinações consistentes por tipo de desastre.",
    tradeoff: "Protege a compatibilidade entre produtos e facilita trocar famílias. Acrescentar um novo tipo de produto afeta todas as fábricas concretas; pode ser pesado quando as famílias têm pouca variação.",
    code: String.raw`interface Shelter { open(people: number): Promise<void> }
interface Transport { evacuate(zone: string): Promise<void> }
interface Alert { notify(zone: string): Promise<void> }

interface ResponseKit {
  shelter: Shelter;
  transport: Transport;
  alert: Alert;
}
interface ResponseFactory {
  createKit(): ResponseKit;
}

class FloodFactory implements ResponseFactory {
  createKit(): ResponseKit {
    return {
      shelter: new ElevatedSchoolShelter(),
      transport: new AmphibiousBus(),
      alert: new RiverGaugeAlerts()
    };
  }
}
class QuakeFactory implements ResponseFactory {
  createKit(): ResponseKit {
    return {
      shelter: new OpenFieldShelter(),
      transport: new SearchAndRescueHelicopter(),
      alert: new SeismicCellBroadcast()
    };
  }
}

async function respond(factory: ResponseFactory, zone: string) {
  const kit = factory.createKit();
  await kit.alert.notify(zone);
  await kit.transport.evacuate(zone);
  await kit.shelter.open(await estimatePeople(zone));
}`
  },
  {
    id: "builder",
    name: "Builder",
    family: "Criação",
    number: "04",
    accent: "lime",
    tagline: "Monte objetos complexos em etapas, validando o resultado final.",
    scenario: "Plano de missão de um rover autônomo",
    intent: "Separar a construção passo a passo da representação final do objeto, especialmente quando há muitas opções ou regras de validação.",
    use: "Use quando um objeto tem parâmetros obrigatórios e opcionais, combinações válidas ou uma sequência legível de configuração.",
    tradeoff: "Torna a montagem expressiva e concentra validações. Acrescenta classes e pode ser excesso para objetos pequenos, simples ou com poucos argumentos.",
    code: String.raw`type Priority = "sample" | "rescue" | "science";
type Mission = {
  destination: string;
  avoid: string[];
  reserve: number;
  priority: Priority;
};

class MissionBuilder {
  private avoid: string[] = [];
  private reserve = 0.2;
  private priority: Priority = "science";

  constructor(private readonly destination: string) {}
  avoidZones(...zones: string[]) { this.avoid.push(...zones); return this; }
  reservePower(fraction: number) { this.reserve = fraction; return this; }
  for(priority: Priority) { this.priority = priority; return this; }

  build(): Mission {
    if (!this.destination.trim()) throw new Error("Destino obrigatório");
    if (this.reserve < 0.1 || this.reserve > 0.8) {
      throw new Error("Reserva de energia fora do intervalo seguro");
    }
    return {
      destination: this.destination,
      avoid: [...new Set(this.avoid)],
      reserve: this.reserve,
      priority: this.priority
    };
  }
}

const plan = new MissionBuilder("cratera-olympus")
  .avoidZones("encosta-instavel", "duna-7", "duna-7")
  .reservePower(0.35)
  .for("sample")
  .build();`
  },
  {
    id: "adapter",
    name: "Adapter",
    family: "Estrutura",
    number: "05",
    accent: "blue",
    tagline: "Faça duas interfaces incompatíveis conversarem sem reescrever o legado.",
    scenario: "Sensores meteorológicos legados em um novo painel",
    intent: "Converter a interface de um serviço existente para o contrato que o cliente espera, preservando ambos os lados.",
    use: "Use ao integrar SDKs, APIs antigas, dispositivos ou bibliotecas cuja interface não pode mudar, mas cujos dados precisam entrar em uma aplicação moderna.",
    tradeoff: "Isola incompatibilidades e reduz impacto no domínio. Uma cadeia de adaptadores pode esconder conversões, perdas de precisão ou erros de unidade; documente e teste as transformações.",
    code: String.raw`type Forecast = { pressureHpa: number; observedAt: Date };
interface WeatherPort { read(): Promise<Forecast> }

type LegacyGauge = {
  sample(): Promise<{ pressure: string; epochSeconds: number }>;
};

class GaugeAdapter implements WeatherPort {
  constructor(private readonly gauge: LegacyGauge) {}

  async read(): Promise<Forecast> {
    const raw = await this.gauge.sample();
    const match = /^([\d.]+)\s*(inHg|hPa)$/.exec(raw.pressure);
    if (!match) throw new Error("Unidade barométrica desconhecida");

    const value = Number(match[1]);
    const pressureHpa = match[2] === "inHg" ? value * 33.8639 : value;
    return {
      pressureHpa: Math.round(pressureHpa * 10) / 10,
      observedAt: new Date(raw.epochSeconds * 1_000)
    };
  }
}

const forecast = await new GaugeAdapter(oldGauge).read();
weatherDashboard.plot(forecast.pressureHpa);`
  },
  {
    id: "decorator",
    name: "Decorator",
    family: "Estrutura",
    number: "06",
    accent: "blue",
    tagline: "Acrescente responsabilidades em camadas, preservando a mesma interface.",
    scenario: "Pontuação de risco florestal com cache e auditoria",
    intent: "Envolver um objeto com outro que implementa o mesmo contrato, adicionando comportamento antes ou depois da chamada original.",
    use: "Use para combinar funcionalidades opcionais como cache, métricas, auditoria, retry ou autorização sem criar subclasses para cada combinação.",
    tradeoff: "Composição flexível e extensível; a ordem das camadas importa e pilhas profundas podem dificultar depuração. Ao contrário da herança, o consumidor pode não perceber quais efeitos foram aplicados.",
    code: String.raw`type Signal = { zone: string; humidity: number };
interface RiskScorer { score(signal: Signal): Promise<number> }

class CachedScorer implements RiskScorer {
  private cache = new Map<string, { score: number; at: number }>();
  constructor(private readonly inner: RiskScorer) {}

  async score(signal: Signal): Promise<number> {
    const key = JSON.stringify(signal);
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < 30_000) return hit.score;
    const score = await this.inner.score(signal);
    this.cache.set(key, { score, at: Date.now() });
    return score;
  }
}
class AuditedScorer implements RiskScorer {
  constructor(private readonly inner: RiskScorer, private readonly log: AuditLog) {}
  async score(signal: Signal): Promise<number> {
    const score = await this.inner.score(signal);
    await this.log.write({ zone: signal.zone, score, at: new Date() });
    return score;
  }
}

const scorer: RiskScorer = new AuditedScorer(
  new CachedScorer(new SatelliteRiskModel()), auditLog
);
const score = await scorer.score(sensorReading);`
  },
  {
    id: "facade",
    name: "Façade",
    family: "Estrutura",
    number: "07",
    accent: "blue",
    tagline: "Ofereça uma entrada simples para um subsistema cheio de peças.",
    scenario: "Estabilização segura de um biorreator remoto",
    intent: "Fornecer uma interface de nível mais alto que coordena um subsistema, escondendo a ordem e os detalhes de seus componentes.",
    use: "Use para reduzir acoplamento entre uma tela ou caso de uso e vários serviços de baixo nível, especialmente quando uma operação exige sequência e verificações.",
    tradeoff: "Diminui a complexidade percebida e centraliza o fluxo. Não deve virar um objeto gigante que acumula toda a lógica do domínio nem impedir acesso a operações avançadas quando necessário.",
    code: String.raw`type Reading = { toxinPpm: number; salinity: number };
type Result = { status: "stable" | "quarantined" };

class ReactorFacade {
  constructor(
    private readonly sensors: Sensors,
    private readonly pump: Pump,
    private readonly doser: NutrientDoser,
    private readonly alarms: AlarmBus,
    private readonly audit: AuditLog
  ) {}

  async stabilize(tank: string): Promise<Result> {
    const reading: Reading = await this.sensors.sample(tank);
    if (reading.toxinPpm > 2) {
      await this.pump.stop(tank);
      await this.alarms.quarantine(tank, reading.toxinPpm);
      return { status: "quarantined" };
    }

    await this.pump.setFlow(tank, targetFlow(reading.salinity));
    try {
      await this.doser.balance(tank, reading.salinity);
      await this.audit.record("tank-stabilized", { tank, reading });
      return { status: "stable" };
    } catch (error) {
      await this.pump.stop(tank); // estado seguro se a dosagem falhar
      throw error;
    }
  }
}

const result = await reactor.stabilize("bio-07");`
  },
  {
    id: "iterator",
    name: "Iterator",
    family: "Comportamento",
    number: "08",
    accent: "coral",
    tagline: "Percorra uma coleção sem expor como ela é armazenada ou paginada.",
    scenario: "Detecções em um arquivo orbital paginado",
    intent: "Disponibilizar uma forma sequencial de acessar elementos sem expor a estrutura interna da coleção.",
    use: "Use para percorrer coleções customizadas, dados paginados, streams ou resultados que devem ser produzidos sob demanda.",
    tradeoff: "Desacopla consumidor e armazenamento e pode economizar memória com avaliação preguiçosa. Iteradores assíncronos trazem fluxo de erro e cancelamento que precisam ser tratados; um cursor pode ser consumido uma única vez.",
    code: String.raw`type Detection = { tile: string; confidence: number };
type Page = { items: Detection[]; next?: string };
interface OrbitArchive {
  fetchPage(cursor?: string): Promise<Page>;
}

async function* reliableDetections(
  archive: OrbitArchive,
  minimum = 0.92
): AsyncGenerator<Detection> {
  let cursor: string | undefined;
  do {
    const page = await archive.fetchPage(cursor);
    for (const item of page.items) {
      if (item.confidence >= minimum) yield item;
    }
    cursor = page.next;
  } while (cursor);
}

for await (const hit of reliableDetections(archive)) {
  await queueForAnalyst({ tile: hit.tile, confidence: hit.confidence });
  if (hit.tile === mission.targetTile) break; // para cedo; páginas restantes não são buscadas
}`
  },
  {
    id: "observer",
    name: "Observer",
    family: "Comportamento",
    number: "09",
    accent: "coral",
    tagline: "Avise vários interessados quando um estado mudar, sem acoplá-los entre si.",
    scenario: "Rede de sensores que detecta risco de incêndio",
    intent: "Definir uma relação um-para-muitos: quando o sujeito muda, notifica observadores inscritos.",
    use: "Use para atualizações reativas, eventos de domínio, interfaces e integrações em que emissores não devem conhecer todos os consumidores.",
    tradeoff: "Facilita adicionar consumidores sem alterar o emissor. Pode tornar a ordem e o custo das notificações menos óbvios; cuide de unsubscribe, falhas isoladas e ciclos de vida para evitar vazamentos.",
    code: String.raw`type FireSignal = { zone: string; heat: number; humidity: number };
type Listener<T> = (event: T) => void;

class Subject<T> {
  private listeners = new Set<Listener<T>>();
  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(event: T) {
    for (const listener of [...this.listeners]) listener(event);
  }
}

const signals = new Subject<FireSignal>();
const unsubscribe = signals.subscribe(({ zone, heat, humidity }) => {
  if (heat > 48 && humidity < 18) dispatchEvacuation(zone);
});
signals.subscribe(({ zone, heat }) => dashboard.mark(zone, heat));

sensor.onReading((reading) => signals.emit(reading));
// Ao encerrar a estação, a assinatura é removida explicitamente.
unsubscribe();`
  },
  {
    id: "strategy",
    name: "Strategy",
    family: "Comportamento",
    number: "10",
    accent: "coral",
    tagline: "Troque o algoritmo sem trocar o contexto que o utiliza.",
    scenario: "Roteamento de equipes em uma ilha isolada",
    intent: "Encapsular algoritmos intercambiáveis sob uma interface comum, permitindo escolher ou substituir a regra em tempo de execução.",
    use: "Use quando políticas de decisão variam por contexto, usuário ou configuração, ou quando vários algoritmos devem ser comparados sem condicionais no cliente.",
    tradeoff: "Evita grandes blocos de if/else e torna cada política testável. O cliente precisa conhecer ou selecionar as estratégias; a abstração pode ser desnecessária quando existe apenas um algoritmo estável.",
    code: String.raw`type Mission = { urgency: number; seaState: number };
type Route = { etaMin: number; risk: number; fuel: number };
interface RouteStrategy { plan(mission: Mission): Route | null }

class DroneRoute implements RouteStrategy {
  plan(m: Mission): Route | null {
    if (m.seaState < 0.9) return { etaMin: 12, risk: 0.22, fuel: 18 };
    return null;
  }
}
class AmphibiousRoute implements RouteStrategy {
  plan(m: Mission): Route {
    return { etaMin: 34, risk: 0.08 + m.seaState * 0.12, fuel: 42 };
  }
}
class FootTeamRoute implements RouteStrategy {
  plan(m: Mission): Route {
    return { etaMin: 51 - m.urgency * 4, risk: 0.14, fuel: 6 };
  }
}

function chooseRoute(m: Mission, policies: RouteStrategy[]): Route {
  const viable = policies
    .map((policy) => policy.plan(m))
    .filter((route): route is Route => route !== null && route.risk < 0.3);
  if (!viable.length) throw new Error("Nenhuma rota dentro do risco permitido");
  return viable.sort((a, b) => a.etaMin + a.fuel * 0.2 - (b.etaMin + b.fuel * 0.2))[0];
}

const route = chooseRoute(alert, [new DroneRoute(), new AmphibiousRoute(), new FootTeamRoute()]);`
  }
];

export const families = ["Criação", "Estrutura", "Comportamento"];
