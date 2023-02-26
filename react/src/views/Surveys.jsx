import React, {useEffect, useRef, useState} from 'react';
import {useStateContext} from "../contexts/ContextProvider.jsx";
import PageComponent from "../layouts/PageComponent.jsx";
import SurveyListItem from "../components/SurveyListItem.jsx";
import TButton from "../components/core/TButton.jsx";
import {PlusCircleIcon} from "@heroicons/react/24/solid/index.js";
import axiosClient from "../axios.js";
import PaginationLinks from "../components/PaginationLinks.jsx";

const Surveys = () => {
    const [surveys, setSurveys] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const {showToast} = useStateContext();


    const shouldRun = useRef(true); // We use this so useEffect doesent run twice https://www.youtube.com/watch?v=MXSuOR2yRvQ
    useEffect(  () => {
        if (shouldRun.current) {
            shouldRun.current = false;
            getSurveys();
        }
    }, []);

    // Context =========================================================
    // const { surveys } = useStateContext(); // We dont use that anymore, because we dont need surveys in context, we need it only in here, so no need

    // Methods =========================================================

    const onPageClick = (link) => {
        getSurveys(link.url);
    };

    const onDeleteClick = (id) => {
        if (window.confirm("Are you sure you want to delete this survey?")) {
            axiosClient.delete(`/surveys/${id}`).then(() => {
                getSurveys();
                showToast('The survey was deleted');
                // showToast('The survey was deleted');
            });
        }
    };

    const getSurveys = (url) => {
        url = url || "/surveys";
        setLoading(true);
        axiosClient.get(url)
            .then(({ data }) => {
                setLoading(false);
                setSurveys(data.data);
                setMeta(data.meta);
            });
    };


    return (
        <PageComponent
            title={'Surveys'}

            buttons={(
                <TButton color={'green'} to='/surveys/create'>
                    <PlusCircleIcon className={'h-6 w-6 mr-2'} />
                    Create new
                </TButton>
            )}
        >
            { ( loading) && (<div className={'text-center text-lg'}>Loading...</div>)}

            { ( !loading) && (
                <div>
                    {surveys.length === 0 && (
                        <div className="py-8 text-center text-gray-700">
                            You don't have surveys created
                        </div>
                    )}

                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3'>
                        {surveys.map( (survey, index) => (
                            <SurveyListItem
                                survey={survey}
                                key={survey.id}
                                deleteClickHandler={onDeleteClick}
                            >

                            </SurveyListItem>
                        ))}
                    </div>

                    {surveys.length > 0 && <PaginationLinks meta={meta} onPageClick={onPageClick} />}
                </div>
            )}
        </PageComponent>
    );
};

export default Surveys;
