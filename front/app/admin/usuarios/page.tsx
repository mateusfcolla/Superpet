import HistoryArrows from "../components/HistoryArrows";

export default function Usuarios() {
  return (
    <>
      <div className='list-clients-header wk-admin-page-wrapper w-full my-7 font-Inter'>
        <div className='arrows-wrapper w-fit gap-2'>
          <HistoryArrows />
        </div>
        <div className='title-wrapper grid grid-cols-2 mt-7'>
          <h1 className='text-5xl font-semibold '>Em Breve</h1>
          {/*  <div className='wk-btn__wrapper ml-auto gap-6 '>
            <Link
              className='wk-btn wk-btn--primary wk-btn--md'
              href={"/admin/clientes/criar"}>
              <PlusIcon />
              Novo Cliente
            </Link>
          </div> */}
        </div>
      </div>
    </>
  );
}
