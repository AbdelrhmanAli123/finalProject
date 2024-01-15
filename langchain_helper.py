from langchain.llms import GooglePalm
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.document_loaders.csv_loader import CSVLoader
from dotenv import load_dotenv
load_dotenv()
llm=GooglePalm(google_api_key='AIzaSyC4hqqEi-cLzKD6T3drRaSaS302Pq47fAo',Temperature=0.9)
embeddings = HuggingFaceBgeEmbeddings()
vectordb_file_path='faiss_index'
def create_vector_db():
         loader = CSVLoader(file_path='version1chatbot.csv', source_column='Name')
         data = loader.load()
         vectordb = FAISS.from_documents(documents=data, embedding=embeddings)
         vectordb.save_local(vectordb_file_path)

def get_qa_chain():
    # Load the vector database from the local folder
    vectordb = FAISS.load_local(vectordb_file_path,embeddings)

    # Create a retriever for querying the vector database
    retriever = vectordb.as_retriever(score_threshold=0.7)
    prompt_template = """Delve into the vast realm of knowledge and illuminate the mysteries surrounding Sphinx. Uncover the enigmatic details and unravel the tapestry of information woven in its legacy.

    In the grand expanse of wisdom, explore the following:

    CONTEXT: {context}

    As you embark on this intellectual journey, pose your inquiry, a beacon seeking enlightenment:

    QUESTION: {question}

    Craft your response with eloquence, drawing upon the essence of the 'response' section within our treasury of knowledge. Let your words paint a vivid picture, capturing the nuances and intricacies that define Sphinx. May your answer resonate as a symphony of erudition, unveiling the depths of understanding.

    Should the oracle fall silent, fear not, for in the shadows of uncertainty, honesty prevails:

    "I don't know."

    Embark, intrepid seeker, on this odyssey through the annals of Sphinx's wisdom!
    """

    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )


    chain = RetrievalQA.from_chain_type(llm=llm,
                                        chain_type="stuff",
                                        retriever=retriever,
                                        input_key="query",
                                        return_source_documents=True,
                                        chain_type_kwargs={"prompt": PROMPT})

    return chain

if __name__ == "__main__" :
           create_vector_db()
           chain = get_qa_chain()
           print(chain("do you know sphinx?"))