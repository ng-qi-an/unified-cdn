export default function getUpdatedKeys(before: unknown, after: unknown, path = ""): string[] {
    if (before === null || after === null || typeof before !== "object" || typeof after !== "object" || Array.isArray(before) || Array.isArray(after)) {
        return Object.is(before, after) ? [] : [path];
    }
    const beforeRecord = before as Record<string, unknown>;
    const afterRecord = after as Record<string, unknown>;
    const keys = new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord),]);
    return [...keys].flatMap((key) => getUpdatedKeys(beforeRecord[key], afterRecord[key], path ? `${path}.${key}` : key));
}
