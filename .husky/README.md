# Husky Git Hooks

Bu dizin Git hooks'larını içerir.

## Hooks

### `pre-commit`

Commit öncesi çalışır:

- Type check
- Lint check
- Test (sadece değişen dosyalar)
- Code formatting

### `pre-push`

Push öncesi çalışır:

- Tüm testler (unit + E2E)

## Kurulum

Husky otomatik olarak `npm install` sırasında kurulur (`prepare` script).

Manuel kurulum için:

```bash
npm run prepare
```

## Kullanım

Hooks otomatik olarak çalışır. Commit veya push yapmaya çalıştığınızda hooks devreye girer.

Hook'u atlamak için (önerilmez):

```bash
git commit --no-verify
git push --no-verify
```
