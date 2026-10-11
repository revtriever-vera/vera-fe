import { useState, type ReactElement, type ReactNode } from 'react';
import { Search, Wallet } from 'lucide-react';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { CopyField } from '@/shared/ui/copy-field';
import { DateField } from '@/shared/ui/date-field';
import { EmptyState } from '@/shared/ui/empty-state';
import { SampleDataBanner } from '@/shared/ui/sample-data-banner';
import { SampleDataButton } from '@/shared/ui/sample-data-button';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Field } from '@/shared/ui/field';
import { FileDrop } from '@/shared/ui/file-drop';
import { IconTile } from '@/shared/ui/icon-tile';
import { KpiTile } from '@/shared/ui/kpi';
import { Modal } from '@/shared/ui/modal';
import { Money } from '@/shared/ui/money';
import { Pager } from '@/shared/ui/pager';
import { PillNav } from '@/shared/ui/pill-nav';
import { SearchInput } from '@/shared/ui/search-input';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import { SkeletonForm, SkeletonPanel } from '@/shared/ui/skeleton-form';
import { SkeletonTable } from '@/shared/ui/skeleton-table';
import { StatusDot } from '@/shared/ui/status-dot';
import { Stepper } from '@/shared/ui/stepper';
import { Table, type TableColumn } from '@/shared/ui/table';
import { TabNav } from '@/shared/ui/tab-nav';
import { Balloon, RichBalloon } from '@/shared/ui/tooltip';

interface HoldingRow {
    readonly id: string;
    readonly name: string;
    readonly value: number;
    readonly currency: string;
}

const ROWS: readonly HoldingRow[] = [
    { id: 'a', name: 'Tesouro IPCA+', value: 1250000, currency: 'BRL' },
    { id: 'b', name: 'S&P 500 ETF', value: 842050, currency: 'USD' },
    { id: 'c', name: 'Fundo imobiliário', value: 310075, currency: 'BRL' }
];

const COLUMNS: readonly TableColumn<HoldingRow>[] = [
    { key: 'name', header: 'Ativo', render: (row: HoldingRow): ReactNode => row.name },
    {
        key: 'value',
        header: 'Valor',
        render: (row: HoldingRow): ReactNode => <Money amountMinor={row.value} currency={row.currency} />
    }
];

const CHOICES: readonly SelectChoice[] = [
    { value: 'brl', label: 'Real (BRL)', warning: null },
    { value: 'usd', label: 'Dólar (USD)', warning: null },
    { value: 'eur', label: 'Euro (EUR)', warning: 'Cotação desatualizada' }
];

export function Section({ title, children }: { readonly title: string; readonly children: ReactNode }): ReactElement {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <div className="flex flex-wrap items-start gap-3">{children}</div>
        </section>
    );
}

export function ActionsSection(): ReactElement {
    return (
        <Section title="Botões e selos">
            <Button>Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="danger">Excluir</Button>
            <Button disabled>Desabilitado</Button>
            <Badge tone="accent">Novo</Badge>
            <Badge tone="positive">Ativo</Badge>
            <Badge tone="caution">Pendente</Badge>
            <Badge tone="critical">Falhou</Badge>
            <Badge>Rascunho</Badge>
        </Section>
    );
}

export function FormsSection(): ReactElement {
    const [query, setQuery] = useState<string>('');
    const [currency, setCurrency] = useState<string>('brl');
    const [date, setDate] = useState<string | null>('2026-10-11');
    return (
        <Section title="Formulários">
            <div className="flex w-full max-w-sm flex-col gap-3">
                <Field label="E-mail" type="email" hint="Usado para entrar" />
                <Field label="Senha" type="password" error="Mínimo de 8 caracteres" />
                <SearchInput value={query} onChange={setQuery} placeholder="Buscar ativo" label="Buscar" />
                <SelectMenu
                    value={currency}
                    choices={CHOICES}
                    placeholder="Moeda"
                    onChange={setCurrency}
                    leading={<Search aria-hidden />}
                />
                <DateField label="Data" value={date} onChange={setDate} />
                <CopyField value="vera-1234" copyLabel="Copiar código" />
                <FileDrop
                    label="Extrato"
                    hint="CSV até 1 MB"
                    accept={{ 'text/csv': ['.csv'] }}
                    maxSizeBytes={1_000_000}
                    fileName={null}
                    onPicked={(): void => undefined}
                    onClear={(): void => undefined}
                />
            </div>
        </Section>
    );
}

export function FeedbackSection(): ReactElement {
    const toast: ToastApi = useToast();
    return (
        <Section title="Avisos">
            <div className="flex w-full max-w-xl flex-col gap-3">
                <Alert title="Algo deu errado" detail="Tente novamente em instantes." requestId="req-123" />
                <Alert tone="caution" title="Atenção" detail="Cotação desatualizada." />
                <Alert tone="positive" title="Tudo certo" detail="Importação concluída." />
                <FailureAlert error={new Error('Falha de rede')} title="Não foi possível carregar" />
            </div>
            <Button
                variant="secondary"
                onClick={(): void => {
                    toast.show({ tone: 'positive', title: 'Salvo', detail: 'Alterações aplicadas.' });
                }}
            >
                Mostrar toast
            </Button>
            <Balloon text="Dica rápida">
                <Button variant="secondary">Passe o mouse</Button>
            </Balloon>
            <StatusDot level="blocking" message="Bloqueia o cálculo" />
            <StatusDot level="improvable" message="Pode melhorar" />
            <StatusDot level="done" message="Completo" />
        </Section>
    );
}

function ModalDemo(): ReactElement {
    const [open, setOpen] = useState<boolean>(false);
    const close = (): void => {
        setOpen(false);
    };
    return (
        <>
            <Button
                variant="secondary"
                onClick={(): void => {
                    setOpen(true);
                }}
            >
                Abrir modal
            </Button>
            {open ? (
                <Modal
                    title="Novo ativo"
                    description="Preencha os dados do ativo."
                    onClose={close}
                    footer={<Button onClick={close}>Salvar</Button>}
                >
                    <Field label="Nome" />
                </Modal>
            ) : null}
        </>
    );
}

function ConfirmDemo(): ReactElement {
    const [open, setOpen] = useState<boolean>(false);
    const close = (): void => {
        setOpen(false);
    };
    return (
        <>
            <Button
                variant="danger"
                onClick={(): void => {
                    setOpen(true);
                }}
            >
                Abrir confirmação
            </Button>
            {open ? (
                <ConfirmDialog
                    title="Excluir ativo?"
                    description="O histórico deste ativo também será removido."
                    confirmLabel="Excluir"
                    destructive
                    onConfirm={close}
                    onCancel={close}
                />
            ) : null}
        </>
    );
}

export function DialogsSection(): ReactElement {
    return (
        <Section title="Diálogos">
            <ModalDemo />
            <ConfirmDemo />
        </Section>
    );
}

function SampleDataDemo(): ReactElement {
    const [active, setActive] = useState<boolean>(false);
    const controls: SampleDataControls = {
        available: true,
        active,
        isLoading: false,
        load: (): Promise<void> => {
            setActive(true);
            return Promise.resolve();
        },
        clear: (): Promise<void> => {
            setActive(false);
            return Promise.resolve();
        }
    };
    return (
        <SampleDataContext value={controls}>
            <div className="flex w-full flex-col overflow-hidden rounded-card border border-border">
                <SampleDataBanner />
                <div className="p-4">
                    <EmptyState
                        icon={<Wallet className="size-6" />}
                        title="Sua carteira ainda está vazia"
                        description="Cadastre o que você tem informando só a quantidade."
                        actions={
                            <>
                                <Button>Adicionar primeiro ativo</Button>
                                <SampleDataButton />
                            </>
                        }
                    />
                </div>
            </div>
        </SampleDataContext>
    );
}

export function DataSection(): ReactElement {
    const [page, setPage] = useState<number>(2);
    return (
        <Section title="Dados">
            <div className="flex w-full flex-col gap-3">
                <Table label="Carteira" columns={COLUMNS} rows={ROWS} rowKey={(row: HoldingRow): string => row.id} />
                <Pager page={page} totalPages={5} onChange={setPage} />
                <SkeletonTable label="Carregando carteira" columns={['Ativo', 'Valor']} />
                <EmptyState title="Nada por aqui" description="Cadastre seu primeiro ativo." action={<Button>Adicionar</Button>} />
                <SampleDataDemo />
            </div>
        </Section>
    );
}

export function StructureSection(): ReactElement {
    return (
        <Section title="Estrutura e navegação">
            <BrandLogo />
            <Card className="w-full max-w-sm p-4">
                <p className="font-semibold">Patrimônio</p>
                <Money amountMinor={240212550} currency="BRL" tone="positive" />
            </Card>
            <Card variant="muted" className="w-full max-w-sm p-4">
                Cartão em tom suave
            </Card>
            <div className="flex w-full flex-col gap-3">
                <TabNav
                    label="Abas"
                    tabs={[
                        { to: '/', label: 'Início' },
                        { to: '/ui', label: 'Componentes' }
                    ]}
                />
                <PillNav
                    label="Filtros"
                    items={[
                        { to: '/', label: 'Todos' },
                        { to: '/ui', label: 'Renda fixa' }
                    ]}
                />
                <Stepper label="Passos" steps={[{ label: 'Conta' }, { label: 'Carteira' }, { label: 'Revisão' }]} activeIndex={1} />
                <SkeletonForm label="Carregando formulário" />
                <SkeletonPanel label="Carregando painel" />
            </div>
        </Section>
    );
}

export function SelectionSection(): ReactElement {
    const [currency, setCurrency] = useState<string>('BRL');
    return (
        <Section title="Seleção, destaque e balão rico">
            <SegmentedControl
                label="Moeda base"
                options={[
                    { value: 'BRL', label: 'R$' },
                    { value: 'USD', label: 'US$' }
                ]}
                value={currency}
                onChange={setCurrency}
            />
            <SegmentedControl
                label="Moeda base desabilitada"
                options={[
                    { value: 'BRL', label: 'R$' },
                    { value: 'USD', label: 'US$' }
                ]}
                value="BRL"
                onChange={(): void => undefined}
                disabled
                busy
            />
            <RichBalloon
                content={
                    <span className="flex flex-col gap-0.5">
                        <strong>Ações Brasil</strong>
                        <span>15,0% da carteira, meta de 15%</span>
                    </span>
                }
            >
                <Button variant="secondary">Balão rico</Button>
            </RichBalloon>
            <IconTile icon={Wallet} tone="accent" />
            <IconTile icon={Wallet} tone="positive" size="sm" />
            <KpiTile label="Patrimônio" value="R$ 1.773.100,40" support="atualizado hoje" icon={Wallet} tone="accent" className="w-64" />
        </Section>
    );
}
