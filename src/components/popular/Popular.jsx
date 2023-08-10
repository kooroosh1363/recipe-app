import { useEffect, useState } from "react";
import styled from "styled-components";


function Popular() {

  const [popular, setPopular] = useState([]);



  useEffect(() => {
    popularGet();
  }, []);


  const popularGet = async () => {
    const api = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${process.env.REACT_APP_API_KEY}&number=10`);
    const data = await api.json();
    setPopular(data.recipes);
    console.log(data.recipes)
  }


  return (
    <div>
      {popular.map((recipe) => {
        return (
          <popWrapper>
            <h3>Popular Picks</h3>
            {popular.map((recipe) => {
              return(
                <Card>
                  <p>{recipe.title}</p>
                  <img src={recipe.image} alt={recipe.title} />
                </Card>
              );
            })}
          </popWrapper>
        );
    })}
    </div>
  );
}


const popWrapper = styled.div`
margin:4rem 0rem;
`;

const Card = styled.div`
min-height:25rem;
border-radius:2rem;
`;

export default Popular;
