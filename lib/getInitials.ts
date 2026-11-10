export function getInitials(name: string){
    const parts = name.split(" ");
    if(parts.length === 1){
        return parts[0].charAt(0).toUpperCase();
    } else {
        return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
    }
}