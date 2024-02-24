export interface JwtPayload {

    id: string;
    iat?: number; // Es la fecha de creacion de ltoken
    exp?: number; // Es la fecha de expiracion del web token
}