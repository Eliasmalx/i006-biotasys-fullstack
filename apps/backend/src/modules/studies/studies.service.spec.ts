import { DataSource, Repository } from 'typeorm';
import config from '../../config/dotenv.config';
import { User } from '../users/entities/user.entity';
import { StudiesService } from './studies.service';
import { Study } from './entities/study.entity';
import { StudyProcessingJob } from './entities/study-processing-job.entity';
import { StudyStatusHistory } from './entities/study-status-history.entity';

describe('StudiesService', () => {
  let service: StudiesService;
  let fetchMock: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    service = new StudiesService(
      {} as Repository<Study>,
      {} as Repository<StudyStatusHistory>,
      {} as Repository<StudyProcessingJob>,
      {} as Repository<User>,
      {} as DataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('sends study_id in the payload sent to the AI backend', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    const study = {
      id: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
      studyCode: 'BIO-AR-00001',
      nutritionistId: '7ec2c8ca-c633-43ea-95dc-02af73ad2018',
      patientCode: 'PCT-AR-56321',
      patientAge: 42,
      patientSex: 'FEMENINO',
      rawJson: {
        metadata: {
          sample_type: 'stool',
        },
        taxonomy: {
          phylum: {
            Firmicutes: 46.2,
          },
        },
      },
      studyDate: '2026-03-12',
    } as Study;

    await (service as any).sendStudyToPython(study);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      config.ai.serviceUrl,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          study_id: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
          study_code: 'BIO-AR-00001',
          nutricionist_id: '7ec2c8ca-c633-43ea-95dc-02af73ad2018',
          patient_id: 'PCT-AR-56321',
          raw_json: {
            metadata: {
              sample_type: 'stool',
              sex: 'FEMENINO',
              age: 42,
            },
            taxonomy: {
              phylum: {
                Firmicutes: 46.2,
              },
            },
          },
          study_date: '2026-03-12T00:00:00.000Z',
        }),
      }),
    );
  });

  it('normalizes lab uploads that use raw_json', () => {
    const normalized = (service as any).normalizeUploadStudyJson({
      raw_json: {
        metadata: {
          sample_type: 'stool',
        },
      },
      study_code: 'BIO-AR-00003',
      nutricionist_id: '6f5bfae8-7466-44d6-a767-075dfa2abb22',
      patient_id: 'PCT-AR-60002',
      study_date: '2026-03-10T00:00:00.000Z',
    });

    expect(normalized).toEqual({
      rawJson: {
        metadata: {
          sample_type: 'stool',
        },
      },
      studyCode: 'BIO-AR-00003',
      nutricionistId: '6f5bfae8-7466-44d6-a767-075dfa2abb22',
      patientId: 'PCT-AR-60002',
      studyDate: '2026-03-10T00:00:00.000Z',
    });
  });

  it('maps created_at to report_date in snake_case processing callbacks', () => {
    const normalized = (service as any).resolveNormalizedJson({
      study_id: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
      study_code: 'BIO-AR-00002',
      data: {
        metadata: {},
      },
      interpretation: {
        general_summary: {},
      },
      created_at: '2026-03-13T09:59:19.000Z',
    });

    expect(normalized).toEqual({
      study_id: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
      study_code: 'BIO-AR-00002',
      data: {
        metadata: {},
      },
      interpretation: {
        general_summary: {},
      },
      report_date: '2026-03-13T09:59:19.000Z',
    });
  });

  it('rejects processing callbacks when patient_id does not match the study', () => {
    const study = {
      id: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
      studyCode: 'BIO-AR-00002',
      nutritionistId: '6f5bfae8-7466-44d6-a767-075dfa2abb22',
      patientCode: 'PCT-AR-60001',
      studyDate: '2026-03-10',
    } as Study;

    expect(() =>
      (service as any).validateProcessingResultPayloadAgainstStudy(
        {
          studyId: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
          studyCode: 'BIO-AR-00002',
          nutricionistId: '6f5bfae8-7466-44d6-a767-075dfa2abb22',
          patientId: 'PCT-AR-99999',
          studyDate: '2026-03-10T00:00:00.000Z',
          reportDate: '2026-03-13T09:59:19.000Z',
        },
        study,
      ),
    ).toThrow('patient_id no coincide con el estudio');
  });
});
