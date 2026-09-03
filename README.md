# FrontPulseReport

Proyecto Angular conectado a `json-server` mediante `server/db.json`.

## Cómo correrlo en Windows

### 1. Backend db.json

Abre una terminal en la carpeta del proyecto y ejecuta:

```powershell
cd server
.\start.bat
```

Debe quedar corriendo en:

```text
http://localhost:3000
```

### 2. Frontend Angular

Abre otra terminal en la carpeta raíz del proyecto:

```powershell
npm install
npm start
```

También puedes usar:

```powershell
npx ng serve
```

La página abre en:

```text
http://localhost:4200
```

## Usuario demo

```text
Usuario: enfermera.ana
Contraseña: 123456
```

También puedes crear nuevos usuarios desde la pantalla de registro. Esos usuarios se guardan en `server/db.json`, dentro de la colección `users`.

## Funcionalidades conectadas al db.json

- Login y registro IAM con colección `users`.
- Nuevo paciente.
- Registrar signos vitales.
- Registrar eventos clínicos.
- Registrar traspaso SBAR.
- Reconocer alertas.
- Generar reportes.
- Auditoría automática según el usuario autenticado.
