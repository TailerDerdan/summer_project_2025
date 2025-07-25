export const getMap = async () => {

    try 
    {
        //const response = await fetch(`http://mochilovo-avi.ru:82/gameMap/getMap/map1`, {
        const response = await fetch("/gameMap/getMap/map1", {
                // const response = await fetch("http://localhost:82/gameMap/getMap/map1", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

        const result = await response.json();
        return result.map;
    } 
    catch (error) {
        console.error('Ошибка:', error);
        return null
    }
}

