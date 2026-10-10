export function amount(value, label = "Valor", integer = false) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > Number.MAX_SAFE_INTEGER ||
    (integer && !Number.isInteger(value))
  ) {
    throw new RangeError(
      `${label}: informe um número ${integer ? "inteiro " : ""}não negativo dentro da precisão suportada.`,
    );
  }
  return value;
}
export function percentage(value, label = "Percentual") {
  amount(value, label);
  if (value > 100) throw new RangeError(`${label}: o máximo é 100%.`);
  return value / 100;
}
export function split(value) {
  const result = Object.fromEntries(
    ["light", "medium", "heavy"].map((key) => [
      key,
      percentage(value[key], "Distribuição"),
    ]),
  );
  if (Math.abs(result.light + result.medium + result.heavy - 1) > 0.000001)
    throw new RangeError("A distribuição Leve/Médio/Pesado deve somar 100%.");
  return result;
}
export function range(low, high, details = []) {
  amount(low, "Créditos calculados");
  if (high !== null) {
    amount(high, "Créditos calculados");
    if (high < low) throw new RangeError("A faixa de créditos é inválida.");
  }
  return { low, high, details };
}
export function consolidate(results) {
  if (!results.length) return null;
  return range(
    results.reduce((sum, item) => sum + item.low, 0),
    results.some((item) => item.high === null)
      ? null
      : results.reduce((sum, item) => sum + item.high, 0),
  );
}
