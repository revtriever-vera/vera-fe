/**
 * Ponto de encaixe do TOTP (#161/#167). Hoje o login com audiência `admin` devolve a sessão direto. Quando a API passar a
 * devolver `totp_required` ou `totp_enrollment_required` (token de desafio ou de cadastro, sem sessão), este é o único lugar
 * que deixa de aceitar só `authenticated`: a tela de login troca o botão do Google pelo passo do código antes de chamar
 * `completeSignIn`.
 */
export function resolveAdminSignIn<T extends { readonly outcome: string }>(session: T): T {
    if (session.outcome !== 'authenticated') {
        throw new Error('admin sign-in step not supported yet');
    }
    return session;
}
